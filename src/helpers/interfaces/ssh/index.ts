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
  createJobScript = "cat<<'EOF'>~/webcron/__ID__.sh\nDATE=`date +\\%s`\n__JOB__ >>  ~/webcron/cron_logs/__ID__/$DATE 2> ~/webcron/cron_logs/__ID__/$DATE'_error'\necho \"JendJ=\"`date +\\%s` >> ~/webcron/cron_logs/__ID__/$DATE\nEOF",
  getJobsList = 'ls ~/webcron/cron_logs',
  getJobLogList = 'ls ~/webcron/cron_logs/__ID__',
  getLogFile = 'cat ~/webcron/cron_logs/__ID__/__FILE__',
  delLogFile = 'rm ~/webcron/cron_logs/__ID__/__FILE__',
}
