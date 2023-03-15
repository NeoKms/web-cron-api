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
