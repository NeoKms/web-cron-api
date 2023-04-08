import { NodeSSH, SSHExecCommandOptions } from 'node-ssh';
import { CronJob, SshCommands, SshConfig } from '../../helpers/interfaces/ssh';
import { CronTimeElement } from '../../helpers/interfaces/jobs';
import { Job } from '../../jobs/entities/job.entity';
import * as Sentry from '@sentry/node';
import { CreateLogDto } from '../../log/dto/create-log.dto';
import { plainToInstance } from 'class-transformer';

export class SshClient {
  private readonly WEB_CRON_MARK = 'webcron';
  private readonly config: SshConfig = null;
  private readonly instance: NodeSSH = null;
  private cronJobs: CronJob[] = [];
  constructor(config: SshConfig) {
    this.config = config;
    this.instance = new NodeSSH();
  }
  public async destroy() {
    await this.instance.connection.destroy();
  }
  public async waitConnection(errCnt = 5): Promise<SshClient> {
    return this.instance
      .connect(this.config)
      .then(() => this)
      .catch((err) => {
        if (errCnt > 0) {
          return this.waitConnection(--errCnt);
        } else {
          throw err;
        }
      });
  }

  private execCommand(
    cmd: string,
    params: SSHExecCommandOptions = {},
  ): Promise<string> {
    return this.instance.execCommand(cmd, params).then((result) => {
      if (!result.stderr) {
        return result.stdout;
      } else {
        throw new Error(result.stderr);
      }
    });
  }
  private async createCrontab(): Promise<void> {
    await this.execCommand(SshCommands.initCronFile);
    await this.execCommand(SshCommands.applyCronFile);
  }
  private parseCronTimeElement(el: string): CronTimeElement {
    const splitted = el.split('/');
    return {
      value: +splitted[0],
      period: splitted.length === 2,
    };
  }

  private createLogDir(id: number) {
    return this.execCommand(
      SshCommands.createLogDir.replace('__ID__', id.toString()),
    );
  }
  private setJobScript(job: Job): Promise<string> {
    return this.execCommand(
      SshCommands.createJobScript
        .replace(/__ID__/g, job.id.toString())
        .replace('__JOB__', job.job),
    );
  }
  private parseCronFile(data: string): CronJob[] {
    return data.split('\n').reduce((jobs, row) => {
      if (row.match(this.WEB_CRON_MARK)) {
        const splitted = row.split(' ');
        try {
          jobs.push({
            time: {
              minute: this.parseCronTimeElement(splitted.shift()),
              hour: this.parseCronTimeElement(splitted.shift()),
              day: this.parseCronTimeElement(splitted.shift()),
              month: this.parseCronTimeElement(splitted.shift()),
              weekDay: this.parseCronTimeElement(splitted.shift()),
            },
            id: +splitted
              .join(' ')
              .split('>>')[0]
              .match(/(?<=\/)\d+(?=.sh)/)[0],
            job: splitted.join(' ').split('>>')[0].trim(),
            logfile: splitted.join(' ').split('>>')[1].trim(),
          });
        } catch (e) {
          Sentry.captureException(e);
        }
      }
      return jobs;
    }, [] as CronJob[]);
  }
  public async getCronJobsList(): Promise<CronJob[]> {
    const cronFile = await this.getCronFile();
    this.cronJobs = this.parseCronFile(cronFile);
    return this.cronJobs;
  }

  private createCronJobString(job: Job) {
    const getTime = (timeElement: CronTimeElement): string => {
      return (
        (timeElement.period ? '*/' : '') +
        (timeElement.value >= 0 ? timeElement.value : '*')
      );
    };
    return [
      getTime(job.time.minute),
      getTime(job.time.hour),
      getTime(job.time.day),
      getTime(job.time.weekDay),
      getTime(job.time.month),
      `sh ~/webcron/${job.id}.sh`,
    ].join(' ');
  }

  public async upsertLogs(logService) {
    const jobIds = await this.execCommand(SshCommands.getJobsList).then(
      (data) =>
        data
          .split('\n')
          .map((id_str) => +id_str)
          .filter((id) => !!id),
    );
    for (let i = 0, c = jobIds.length; i < c; i++) {
      const id = jobIds[i];
      const list = await this.execCommand(
        SshCommands.getJobLogList.replace('__ID__', id.toString()),
      );
      const allFiles = list.split('\n').filter((el) => !!el);
      const { logFiles, logErrors } = allFiles.reduce(
        (acc, filename) => {
          if (filename.match('_error')) {
            acc.logErrors.push(filename);
          } else {
            acc.logFiles.push(filename);
          }
          return acc;
        },
        { logFiles: [], logErrors: [] },
      );
      for (let i2 = 0, c2 = logFiles.length; i2 < c2; i2++) {
        const logFileName = logFiles[i2];
        const [logText, end] = await this.execCommand(
          SshCommands.getLogFile
            .replace('__ID__', id.toString())
            .replace('__FILE__', logFileName),
        ).then((content) => content.split('\nJendJ='));
        const errorFileName = logErrors.find((el) => el.match(logFileName));
        let errorText = '';
        if (errorFileName) {
          errorText = await this.execCommand(
            SshCommands.getLogFile
              .replace('__ID__', id.toString())
              .replace('__FILE__', errorFileName),
          ).then((t) => t.trim());
        }
        if (end) {
          await this.execCommand(
            SshCommands.delLogFile
              .replace('__ID__', id.toString())
              .replace('__FILE__', logFileName),
          );
          if (errorFileName) {
            await this.execCommand(
              SshCommands.delLogFile
                .replace('__ID__', id.toString())
                .replace('__FILE__', errorFileName),
            );
          }
        }
        const logObj = plainToInstance(CreateLogDto, {
          timestamp_start: +logFileName,
          timestamp_end: end ? +end : null,
          status: end ? (errorText ? 3 : 2) : 1,
          content: {
            text: logText,
            error: errorText,
          },
          jobEntityId: id,
        });
        await logService.create(logObj);
      }
    }
  }

  private deleteAllJobsFromFile(cronFile: string): string {
    const splitted = cronFile.split('\n');
    splitted
      .reduce((iArr, row, i) => {
        row.match(this.WEB_CRON_MARK) && iArr.push(i);
        return iArr;
      }, [])
      .reverse()
      .forEach((i) => splitted.splice(i, 1));
    return splitted.join('\n');
  }
  public async setJobs(jobs: Job[]) {
    let cronFile = await this.getCronFile().then((f) =>
      this.deleteAllJobsFromFile(f),
    );
    const promises = [];
    jobs.forEach((job) => {
      cronFile += `\n${this.createCronJobString(job)}`;
      promises.push(this.createLogDir(job.id));
    });
    await Promise.all(promises);
    await Promise.all(jobs.map((job) => this.setJobScript(job)));
    return this.setCronFile(cronFile);
  }
  private async getCronFile(): Promise<string> {
    return this.execCommand(SshCommands.getCronFile).catch((err) => {
      if (err.message.indexOf('no crontab') !== -1) {
        return this.createCrontab().then(() => this.getCronFile());
      } else {
        throw new Error(err);
      }
    });
  }
  private async setCronFile(jobs: string): Promise<string> {
    return this.execCommand(SshCommands.setCron.replace('__JOBS__', jobs)).then(
      () => this.execCommand(SshCommands.applyCronFile),
    );
  }
}
