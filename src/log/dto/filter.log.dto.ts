import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import PaginationDto from '../../helpers/pagination.dto';
import { LogStatusesType } from '../../helpers/interfaces/log';

class FilterProps {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  sshId?: number;
  @IsNumber()
  @IsPositive()
  @IsOptional()
  jobId?: number;
  @IsOptional()
  @IsEnum([1, 2, 3])
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
