export interface CronTimeElement {
  value: number;
  period: boolean;
}
export interface CronTimer {
  minute: CronTimeElement;
  hour: CronTimeElement;
  day: CronTimeElement;
  month: CronTimeElement;
  weekDay: CronTimeElement;
}
