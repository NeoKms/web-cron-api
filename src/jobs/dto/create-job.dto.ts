import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsInstance,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CronTimerDto } from './cron-timer.dto';
import { Job } from '../entities/job.entity';

@Exclude()
export default class CreateJobDto {
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  public sshEntityId: number;
  @Expose()
  @IsString()
  @IsNotEmpty()
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
          value: -1,
        };
      }
    });
    return it;
  }
}
