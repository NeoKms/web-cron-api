import { Exclude, Expose, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsObject, IsString } from 'class-validator';
import RightsDto from '../../auth/dto/rights.dto';

@Exclude()
export class ResponseUserDto {
  @Expose()
  @IsNumber()
  public login_cnt: number;

  @Expose()
  @IsNumber()
  public banned_to: number;

  @Expose()
  @IsObject()
  @Type(() => RightsDto)
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

  @Expose()
  @IsBoolean()
  public active: boolean;
}
