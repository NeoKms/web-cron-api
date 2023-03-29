import { CronTimer } from '../jobs';

export interface SshConfig {
  host: string;
  port?: number;
  privateKeyPath: string;
  username: string;
}
export interface CronJob {
  id?: number;
  time: CronTimer;
  job: string;
  logfile: string;
}
export enum SshCommands {
  getCron = 'crontab -l',
  createCronTemplate1 = "echo '' > ~/crontabFile",
  createCronTemplate2 = 'crontab ~/crontabFile',
  setCron = "cat<<'EOF'>~/crontabFile\n__JOBS__\nEOF",
  createLogDir = 'mkdir -p ~/cron_logs/__ID__',
}
