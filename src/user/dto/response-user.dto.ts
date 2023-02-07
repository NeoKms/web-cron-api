import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, IsObject, IsString } from 'class-validator';
import User from '../entities/user.entity';
import RightsDto from '../../auth/dto/rights.dto';
import { PartialType } from '@nestjs/mapped-types';

@Exclude()
export class ResponseUserDto extends PartialType(User) {
  @Expose()
  @IsNumber()
  public login_cnt: number;

  @Expose()
  @IsNumber()
  public banned_to: number;

  @Expose()
  @IsObject()
  @Type((type) => RightsDto)
  public rights: RightsDto;

  @Expose()
  @IsString()
  public login: string;

  @Expose()
  @IsNumber()
  public id: number;

  @Expose()
  @IsString()
  public fio: string;

  @Expose()
  @IsString()
  public phone: string;
}
