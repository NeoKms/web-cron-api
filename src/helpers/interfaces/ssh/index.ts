export interface SshConfig {
  host: string;
  port?: number;
  privateKeyPath: string;
  username: string;
}
export interface CronTimeElement {
  value: string;
  period: string;
}
export interface CronTimer {
  minute: CronTimeElement;
  hour: CronTimeElement;
  day: CronTimeElement;
  month: CronTimeElement;
  weekDay: CronTimeElement;
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
