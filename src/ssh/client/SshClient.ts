import { NodeSSH, SSHExecCommandOptions } from 'node-ssh';
import {
  CronJob,
  CronTimeElement,
  SshCommands,
  SshConfig,
} from '../../helpers/interfaces/ssh';

export class SshClient {
  private readonly WEB_CRON_MARK = '#web-cron';
  private readonly config: SshConfig = null;
  private readonly instance: NodeSSH = null;
  private cronJobs: CronJob[] = [];
  constructor(config: SshConfig) {
    this.config = config;
    this.instance = new NodeSSH();
  }
  public async waitConnection(): Promise<SshClient> {
    return this.instance.connect(this.config).then(() => this);
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
    const cmd = SshCommands.createCronTemplate.replace(
      '__USERNAME__',
      this.config.username,
    );
    await this.execCommand(cmd);
  }
  private parseCronTimeElement(el: string): CronTimeElement {
    const splitted = el.split('/');
    const element: CronTimeElement = {
      value: splitted[0],
      period: '*',
    };
    if (splitted.length === 2) {
      element.period = splitted[1];
    }
    return element;
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
  public async getCronList(): Promise<CronJob[]> {
    const cronFile = await this.getCronFile();
    this.cronJobs = this.parseCronFile(cronFile);
    return this.cronJobs;
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
}
