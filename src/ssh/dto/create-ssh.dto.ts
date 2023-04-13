import { PartialType } from '@nestjs/mapped-types';
import { Ssh } from '../entities/ssh.entity';
import { Exclude, Expose } from 'class-transformer';
import {
  IsDefined,
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPort,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
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
  @MinLength(7)
  @MaxLength(15)
  @IsIP(4)
  public host: string;
  @Expose()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @IsDefined()
  @IsPort()
  public port?: number;
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public username: string;
  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
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
