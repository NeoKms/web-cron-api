import { CronTimer } from '../jobs';

export interface SshConfig {
  host: string;
  port?: number;
  privateKeyPath: string;
  username: string;
}
export interface CronJob {
  time: CronTimer;
  job: string;
  logfile: string;
}
export enum SshCommands {
  getCron = 'crontab -l',
  createCronTemplate = " echo '' > /var/spool/cron/crontabs/__USERNAME__",
}
