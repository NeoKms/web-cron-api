import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CronTimerDto } from './cron-timer.dto';
import { Job } from '../entities/job.entity';

@Exclude()
export default class CreateJobDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  public name: string;
  @Expose()
  @IsNumber()
  @IsPositive()
  public sshEntityId: number;
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(500)
  public job: string;
  @Expose()
  @Type(() => CronTimerDto)
  @ValidateNested()
  @IsObject()
  @IsDefined()
  @IsNotEmptyObject()
  public time: CronTimerDto;

  public toEntity(): Job {
    const it = new Job(this);
    it.isActive = 1;
    Object.keys(it.time).forEach((p) => {
      if (!it.time[p]) {
        it.time[p] = {
          period: false,
          value: '*',
        };
      }
    });
    return it;
  }
}
