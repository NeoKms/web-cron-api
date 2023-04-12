import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import PaginationDto from '../../helpers/pagination.dto';
import { LogStatusesType } from '../../helpers/interfaces/log';

class FilterProps {
  @IsNumber()
  @Min(1)
  @IsOptional()
  sshId?: number;
  @IsNumber()
  @Min(1)
  @IsOptional()
  jobId?: number;
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(3)
  status?: LogStatusesType;
  @IsNumber()
  @Min(1000000000)
  @Max(9999999999)
  @IsOptional()
  timestamp_start?: number;
  @IsNumber()
  @Min(1000000000)
  @Max(9999999999)
  @IsOptional()
  dts?: number;
  @IsNumber()
  @Min(1000000000)
  @Max(9999999999)
  @IsOptional()
  dtf?: number;
}
@Exclude()
export default class FilterLogDto {
  @Expose()
  @IsOptional()
  @IsString({ each: true })
  public select?: Array<string>;
  @Expose()
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterProps)
  public filter?: FilterProps;
  @Expose()
  @IsObject()
  @ValidateNested()
  @IsDefined()
  @IsNotEmptyObject()
  @Type(() => PaginationDto)
  public options: PaginationDto;
}
