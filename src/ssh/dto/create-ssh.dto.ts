import { PartialType } from '@nestjs/mapped-types';
import { Ssh } from '../entities/ssh.entity';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  HasMimeType,
  IsFile,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';
import { getNowTimestampSec } from '../../helpers/constants';
import { ResponseUserDto } from '../../user/dto/response-user.dto';
import { User } from '../../user/entities/user.entity';

@Exclude()
export default class CreateSshDto extends PartialType(Ssh) {
  @Expose()
  @IsString()
  @IsNotEmpty()
  public host: string;
  @Expose()
  @IsString()
  @IsOptional()
  public port?: number;
  @Expose()
  @IsString()
  @IsNotEmpty()
  public username: string;
  @Expose()
  @IsString()
  @IsOptional()
  public description?: string;
  @Expose()
  @IsFile()
  @MaxFileSize(20480)
  @HasMimeType(['application/octet-stream'])
  public privateKey: MemoryStoredFile;

  public toEntity({ id }: Pick<ResponseUserDto, 'id'>): Ssh {
    const it = new Ssh();
    it.created_at = getNowTimestampSec();
    it.host = this.host;
    it.port = this.port || 22;
    it.userEntity = new User({ id });
    it.description = this.description;
    it.username = this.username;
    return it;
  }
}
