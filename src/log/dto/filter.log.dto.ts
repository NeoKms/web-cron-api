import { Exclude, Expose, Type } from 'class-transformer';
import { SimpleObject } from '../../helpers/interfaces/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
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
  @IsOptional()
  @Type(() => PaginationDto)
  public options?: PaginationDto;
}
