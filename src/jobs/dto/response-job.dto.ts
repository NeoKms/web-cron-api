import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { CronTimerDto } from './cron-timer.dto';
import ResponseSshDto from '../../ssh/dto/response-ssh.dto';

@Exclude()
export default class ResponseJobDto {
  @Expose()
  @IsNumber()
  public id: number;
  @Expose()
  @IsString()
  public job: string;
  @Expose()
  @Type(() => CronTimerDto)
  public time: CronTimerDto;
  @Expose()
  public name: string;
  @Expose()
  @IsNumber()
  public sshEntityId: number;
  @Expose()
  @Type(() => ResponseSshDto)
  public sshEntity: ResponseSshDto;
  @Expose()
  @IsNumber()
  isActive: number;
}
