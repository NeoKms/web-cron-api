import { PartialType } from '@nestjs/mapped-types';
import { Ssh } from '../entities/ssh.entity';
import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { getNowTimestampMs } from '../../helpers/constants';

@Exclude()
export default class UpdateSshDto extends PartialType(Ssh) {
  @Expose()
  @IsNumber()
  @IsOptional()
  public port: number;
  @Expose()
  @IsString()
  @IsOptional()
  public username: string;
  @Expose()
  @IsString()
  @IsOptional()
  public description: string;
  public toEntity(): Ssh {
    const it = new Ssh();
    it.id = this.id;
    if (this.port) {
      it.port = this.port;
    }
    if (this.description) {
      it.description = this.description;
    }
    if (this.username) {
      it.username = this.username;
    }
    this.updated_at = getNowTimestampMs();
    return it;
  }
}
