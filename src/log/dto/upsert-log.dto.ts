import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsObject,
  IsPositive,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ContentDto } from './content.dto';
import { Log } from '../eitities/log.entity';
import { LogStatusesType } from '../../helpers/interfaces/log';

@Exclude()
export class UpsertLogDto {
  @Expose()
  @IsNumber()
  @Min(1000000000)
  @Max(9999999999)
  timestamp_start: number;

  @Expose()
  @IsNumber()
  @Min(1000000000)
  @Max(9999999999)
  timestamp_end?: number;

  @Expose()
  @IsEnum([1, 2, 3])
  status: LogStatusesType;

  @Expose()
  @Type(() => ContentDto)
  @IsDefined()
  @ValidateNested()
  @IsObject()
  content: ContentDto;

  @Expose()
  @IsNumber()
  @IsPositive()
  jobEntityId: number;

  @Expose()
  @IsNumber()
  @IsPositive()
  sshEntityId: number;

  public toEntity(): Log {
    return new Log(this as Partial<Log>);
  }
}
