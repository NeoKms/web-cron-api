import { PartialType } from '@nestjs/mapped-types';
import { Ssh } from '../entities/ssh.entity';
import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  HasMimeType,
  IsFile,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';
import { getNowTimestampMs } from '../../helpers/constants';
import { ResponseUserDto } from '../../user/dto/response-user.dto';
import { User } from '../../user/entities/user.entity';

@Exclude()
export default class CreateSshDto extends PartialType(Ssh) {
  @Expose()
  @IsString()
  public host: string;
  @Expose()
  @IsNumber()
  @IsOptional()
  public port: number;
  @Expose()
  @IsString()
  public username: string;
  @Expose()
  @IsString()
  public description: string;
  @Expose()
  @IsFile()
  @MaxFileSize(20480)
  @HasMimeType(['application/octet-stream'])
  public privateKey: MemoryStoredFile;

  public toEntity({ id }: Pick<ResponseUserDto, 'id'>): Ssh {
    const it = new Ssh();
    it.created_at = getNowTimestampMs();
    it.host = this.host;
    it.port = this.port || 22;
    it.userEntity = new User({ id });
    it.description = this.description;
    it.username = this.username;
    return it;
  }
}
