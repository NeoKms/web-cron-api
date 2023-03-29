import { NodeSSH, SSHExecCommandOptions } from 'node-ssh';
import { CronJob, SshCommands, SshConfig } from '../../helpers/interfaces/ssh';
import { CronTimeElement } from '../../helpers/interfaces/jobs';
import { Job } from '../../jobs/entities/job.entity';

export class SshClient {
  private readonly WEB_CRON_MARK = '#web-cron';
  private readonly JOB_ID_MARK = '#id=';
  private readonly config: SshConfig = null;
  private readonly instance: NodeSSH = null;
  private cronJobs: CronJob[] = [];
  constructor(config: SshConfig) {
    this.config = config;
    this.instance = new NodeSSH();
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
    await this.execCommand(SshCommands.createCronTemplate1);
    await this.execCommand(SshCommands.createCronTemplate2);
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
  private parseCronFile(data: string): CronJob[] {
    const jobs: CronJob[] = [];
    let next = false;
    data.split('\n').forEach((row) => {
      if (row === this.WEB_CRON_MARK) {
        next = true;
      } else if (next) {
        next = false;
        const splitted = row.split(' ');
        jobs.push({
          // id: +splitted.pop().trim().replace(this.JOB_ID_MARK, ''),
          time: {
            minute: this.parseCronTimeElement(splitted.shift()),
            hour: this.parseCronTimeElement(splitted.shift()),
            day: this.parseCronTimeElement(splitted.shift()),
            month: this.parseCronTimeElement(splitted.shift()),
            weekDay: this.parseCronTimeElement(splitted.shift()),
          },
          job: splitted.join(' ').split('>>')[0].trim(),
          logfile: splitted.join(' ').split('>>')[1].trim(),
        });
      }
    });
    return jobs;
  }
  public async getCronJobsList(): Promise<CronJob[]> {
    const cronFile = await this.getCronFile();
    this.cronJobs = this.parseCronFile(cronFile);
    return this.cronJobs;
  }

  private jobToString(job: Job): string {
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
      job.job,
      '>>',
      '~/cron_logs/' + job.id + '/`date +\\%s`',
      // this.JOB_ID_MARK + job.id,
    ].join(' ');
  }

  private deleteJobsFromFile(cronFile: string): string {
    const splitted = cronFile.split('\n');
    const indexes = [];
    splitted.forEach((row, i) => {
      if (row === this.WEB_CRON_MARK) {
        indexes.push(i);
        indexes.push(i++);
      }
    });
    indexes.reverse();
    indexes.forEach((i) => splitted.splice(i, 1));
    return splitted.join('\n');
  }
  public async setJobs(jobs: Job[]) {
    let cronFile = await this.getCronFile().then((f) =>
      this.deleteJobsFromFile(f),
    );
    const promises = [];
    jobs.forEach((job) => {
      cronFile += `\n${this.WEB_CRON_MARK}`;
      cronFile += `\n${this.jobToString(job)}`;
      promises.push(this.createLogDir(job.id));
    });
    await Promise.all(promises);
    return this.setCronFile(cronFile);
  }
  private async getCronFile(): Promise<string> {
    return this.execCommand(SshCommands.getCron).catch((err) => {
      if (err.message.indexOf('no crontab') !== -1) {
        return this.createCrontab().then(() => this.getCronFile());
      } else {
        throw new Error(err);
      }
    });
  }
  private async setCronFile(jobs: string): Promise<string> {
    const cmd = SshCommands.setCron
      .replace('__USERNAME__', this.config.username)
      .replace('__JOBS__', jobs);
    return this.execCommand(cmd).then(() =>
      this.execCommand(SshCommands.createCronTemplate2),
    );
  }
}
