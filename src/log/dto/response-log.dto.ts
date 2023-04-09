import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';
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
  @IsObject()
  @Type(() => ContentDto)
  content: ContentDto;
  @IsNumber()
  @Expose()
  jobEntityId: number;
  @IsNumber()
  @Expose()
  sshEntityId: number;
}
