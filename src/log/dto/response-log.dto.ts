import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import ResponseJobDto from '../../jobs/dto/response-job.dto';

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
  @Type(() => ResponseJobDto)
  jobEntity: ResponseJobDto;
}
