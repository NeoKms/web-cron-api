import { Exclude, Expose, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsObject, IsString } from 'class-validator';
import RightsDto from '../../auth/dto/rights.dto';
import { Organization } from '../../organization/entities/organization.entity';

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
  public email: string;

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

  @Expose()
  @IsObject({ each: true })
  @Type(() => Organization)
  public orgEntities: Organization[];

  @Expose()
  @IsNumber()
  public orgSelectedId: number;
}
