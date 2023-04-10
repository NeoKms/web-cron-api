import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ContentDto } from './content.dto';

@Exclude()
export default class ResponseLogDto {
  @Expose()
  @IsNumber()
  timestamp_start: number;
  @Expose()
  @IsNumber()
  timestamp_end: number;
  @Expose()
  @IsNumber()
  status: number;
  @Expose()
  @IsObject()
  @ValidateNested()
  @IsDefined()
  @IsNotEmptyObject()
  @Type(() => ContentDto)
  content: ContentDto;
  @IsNumber()
  @Expose()
  jobEntityId: number;
  @IsNumber()
  @Expose()
  sshEntityId: number;
}
