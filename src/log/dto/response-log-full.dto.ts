import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ContentDto } from './content.dto';
import ResponseLogDto from './response-log.dto';

@Exclude()
export default class ResponseLogFullDto extends ResponseLogDto {
  @Expose()
  @IsObject()
  @ValidateNested()
  @IsDefined()
  @IsNotEmptyObject()
  @Type(() => ContentDto)
  content: ContentDto;
}
