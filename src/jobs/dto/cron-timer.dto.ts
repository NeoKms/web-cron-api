import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

@Exclude()
export class CronTimeElementMinDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  public value: string;
  @Expose()
  @IsBoolean()
  public period: boolean;
}
@Exclude()
export class CronTimeElementHourDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  public value: string;
  @Expose()
  @IsBoolean()
  public period: boolean;
}
@Exclude()
export class CronTimeElementDayOfMonthDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  public value: string;
  @Expose()
  @IsBoolean()
  public period: boolean;
}
@Exclude()
export class CronTimeElementMonthDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  public value: string;
  @Expose()
  @IsBoolean()
  public period: boolean;
}
@Exclude()
export class CronTimeElementDayOfWeekDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  public value: string;
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
