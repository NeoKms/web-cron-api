import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import PaginationDto from '../../helpers/pagination.dto';

@Exclude()
class FilterProps {
  @Expose()
  @IsNumber()
  @IsPositive()
  sshId: number;
}
@Exclude()
export default class FilterJobsDto {
  @Expose()
  @IsOptional()
  @IsString({ each: true })
  public select?: Array<string>;
  @Expose()
  @Type(() => FilterProps)
  @IsOptional()
  @IsDefined()
  @ValidateNested()
  @IsObject()
  public filter?: FilterProps;
  @Expose()
  @IsOptional()
  @Type(() => PaginationDto)
  public options?: PaginationDto;
}
