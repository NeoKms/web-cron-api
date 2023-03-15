import { PartialType } from '@nestjs/mapped-types';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { Job } from '../entities/job.entity';
import { CronTimer } from '../../helpers/interfaces/jobs';
import { CronTimerDto } from './cronTimer.dto';
import { Ssh } from '../../ssh/entities/ssh.entity';

@Exclude()
export default class ResponseJobDto extends PartialType(Job) {
  @Expose()
  @IsNumber()
  public id: number;
  @Expose()
  @IsString()
  public job: string;
  @Expose()
  @IsNumber()
  public port: number;
  @Expose()
  @Type(() => CronTimerDto)
  public time: CronTimerDto;
  @Expose()
  @IsNumber()
  public sshEntityId: number;
  @Expose()
  @Type(() => PartialType(Ssh))
  public sshEntity: Ssh;
}
