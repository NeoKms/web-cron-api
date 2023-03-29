import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

@Exclude()
export class CronTimeElementMinDto {
  @Expose()
  @IsNumber()
  @Min(0)
  @Max(59)
  public value: number;
  @Expose()
  @IsBoolean()
  public period: boolean;
}
@Exclude()
export class CronTimeElementHourDto {
  @Expose()
  @IsNumber()
  @Min(0)
  @Max(23)
  public value: number;
  @Expose()
  @IsBoolean()
  public period: boolean;
}
@Exclude()
export class CronTimeElementDayOfMonthDto {
  @Expose()
  @IsNumber()
  @Min(1)
  @Max(31)
  public value: number;
  @Expose()
  @IsBoolean()
  public period: boolean;
}
@Exclude()
export class CronTimeElementMonthDto {
  @Expose()
  @IsNumber()
  @Min(1)
  @Max(12)
  public value: number;
  @Expose()
  @IsBoolean()
  public period: boolean;
}
@Exclude()
export class CronTimeElementDayOfWeekDto {
  @Expose()
  @IsNumber()
  @Min(0)
  @Max(6)
  public value: number;
  @Expose()
  @IsBoolean()
  public period: boolean;
}
@Exclude()
export class CronTimerDto {
  @Expose()
  @ValidateNested()
  @IsObject()
  @IsDefined()
  @IsNotEmptyObject()
  @IsOptional()
  @Type(() => CronTimeElementMinDto)
  public minute: CronTimeElementMinDto;
  @Expose()
  @ValidateNested()
  @IsObject()
  @IsDefined()
  @IsNotEmptyObject()
  @IsOptional()
  @Type(() => CronTimeElementHourDto)
  public hour: CronTimeElementHourDto;
  @Expose()
  @ValidateNested()
  @IsObject()
  @IsDefined()
  @IsNotEmptyObject()
  @IsOptional()
  @Type(() => CronTimeElementDayOfMonthDto)
  public day: CronTimeElementDayOfMonthDto;
  @Expose()
  @ValidateNested()
  @IsObject()
  @IsDefined()
  @IsNotEmptyObject()
  @IsOptional()
  @Type(() => CronTimeElementMonthDto)
  public month: CronTimeElementMonthDto;
  @Expose()
  @ValidateNested()
  @IsObject()
  @IsDefined()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => CronTimeElementDayOfWeekDto)
  public weekDay: CronTimeElementDayOfWeekDto;
}
