export interface CronTimeElement {
  value: string;
  period: boolean;
}
export interface CronTimer {
  minute: CronTimeElement;
  hour: CronTimeElement;
  day: CronTimeElement;
  month: CronTimeElement;
  weekDay: CronTimeElement;
}
