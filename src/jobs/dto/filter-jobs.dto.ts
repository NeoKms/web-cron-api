import { Exclude, Expose, Type } from 'class-transformer';
import { SimpleObject } from '../../helpers/interfaces/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
import PaginationDto from '../../helpers/pagination.dto';

@Exclude()
export default class FilterJobsDto {
  @Expose()
  @IsString({ each: true })
  public select: Array<string>;
  @Expose()
  @IsObject()
  public filter: SimpleObject;
  @Expose()
  @IsObject()
  public whereRaw: SimpleObject;
  @Expose()
  @Type(() => PaginationDto)
  public options: PaginationDto;
}
