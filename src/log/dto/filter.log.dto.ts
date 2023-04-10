import { Exclude, Expose, Type } from 'class-transformer';
import { SimpleObject } from '../../helpers/interfaces/common';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import PaginationDto from '../../helpers/pagination.dto';

@Exclude()
export default class FilterLogDto {
  @Expose()
  @IsOptional()
  @IsString({ each: true })
  public select?: Array<string>;
  @Expose()
  @IsObject()
  @IsOptional()
  public filter?: SimpleObject;
  @Expose()
  @IsObject()
  @IsOptional()
  public whereRaw?: SimpleObject;
  @Expose()
  @IsObject()
  @ValidateNested()
  @IsDefined()
  @IsNotEmptyObject()
  @Type(() => PaginationDto)
  public options: PaginationDto;
}
