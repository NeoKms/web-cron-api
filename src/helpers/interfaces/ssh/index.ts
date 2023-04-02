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
  getCronFile = 'crontab -l',
  initCronFile = "echo '' > ~/crontabFile",
  applyCronFile = 'crontab ~/crontabFile',
  setCron = "cat<<'EOF'>~/crontabFile\n__JOBS__\nEOF",
  createLogDir = 'mkdir -p ~/webcron/cron_logs/__ID__',
  createJobScript = 'cat<<\'EOF\'>~/webcron/__ID__.sh\n__JOB__\necho "JendJ="`date +\\%s`\nEOF',
  getJobsList = 'ls ~/webcron/cron_logs',
  getJobLogList = 'ls ~/webcron/cron_logs/__ID__',
  getLogFile = 'cat ~/webcron/cron_logs/__ID__/__FILE__',
  delLogFile = 'rm ~/webcron/cron_logs/__ID__/__FILE__',
}
