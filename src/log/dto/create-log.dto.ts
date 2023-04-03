import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
} from 'class-validator';
import { ContentDto } from './content.dto';
import { Log } from '../eitities/log.entity';

@Exclude()
export class CreateLogDto {
  @Expose()
  @IsNumber()
  @Min(1000000000)
  timestamp_start: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  @Min(1000000000)
  timestamp_end?: number;

  @IsNumber()
  @Expose()
  status: number;

  @Expose()
  @IsObject()
  @IsDefined()
  @Type(() => ContentDto)
  content: ContentDto;

  @Expose()
  @IsNumber()
  jobEntityId: number;

  public toEntity(): Log {
    return new Log(this as Partial<Log>);
  }
}
