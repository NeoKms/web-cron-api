import { Exclude, Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class CronTimeElementDto {
  @Expose()
  @IsString()
  public value: string;
  @Expose()
  @IsString()
  public period: string;
}

@Exclude()
export class CronTimerDto {
  @Expose()
  @Type(() => CronTimeElementDto)
  public minute: CronTimeElementDto;
  @Expose()
  @Type(() => CronTimeElementDto)
  public hour: CronTimeElementDto;
  @Expose()
  @Type(() => CronTimeElementDto)
  public day: CronTimeElementDto;
  @Expose()
  @Type(() => CronTimeElementDto)
  public month: CronTimeElementDto;
  @Expose()
  @Type(() => CronTimeElementDto)
  public weekDay: CronTimeElementDto;
}
