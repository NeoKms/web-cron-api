import { Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import PaginateDto from '../../helpers/paginate.dto';
import ResponseLogDto from './response-log.dto';

export class ResponseLogPaginateDto {
  @Expose()
  @IsObject()
  @ValidateNested()
  @IsDefined()
  @IsNotEmptyObject()
  @Type(() => PaginateDto)
  pagination: PaginateDto;
  @Expose()
  @IsObject()
  @ValidateNested()
  @IsDefined()
  @IsNotEmptyObject()
  @Type(() => ResponseLogDto)
  data: ResponseLogDto;
}
