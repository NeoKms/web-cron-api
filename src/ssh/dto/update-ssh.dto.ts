import { PartialType } from '@nestjs/mapped-types';
import { Ssh } from '../entities/ssh.entity';
import { Exclude, Expose } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsPort,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { getNowTimestampSec } from '../../helpers/constants';

@Exclude()
export default class UpdateSshDto extends PartialType(Ssh) {
  @Expose()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @IsDefined()
  @IsPort()
  public port?: number;
  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  public description?: string;
  public toEntity(): Ssh {
    const it = new Ssh();
    it.id = this.id;
    if (this.port) {
      it.port = this.port;
    }
    if (this.description) {
      it.description = this.description;
    }
    this.updated_at = getNowTimestampSec();
    return it;
  }
}
