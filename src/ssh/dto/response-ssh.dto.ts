import { PartialType } from '@nestjs/mapped-types';
import { Ssh } from '../entities/ssh.entity';
import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

@Exclude()
export default class ResponseSshDto extends PartialType(Ssh) {
  @Expose()
  @IsNumber()
  public id?: number;
  @Expose()
  @IsString()
  public host?: string;
  @Expose()
  @IsNumber()
  public port?: number;
  @Expose()
  @IsString()
  public username?: string;
  @Expose()
  @IsString()
  public description?: string;
  @Expose()
  @IsNumber()
  public cntJobs?: number;
  @Expose()
  @IsNumber()
  public cntJobsActive?: number;
  @IsNumber()
  public privateKeyPath?: string;
}
