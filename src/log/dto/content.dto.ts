import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class ContentDto {
  @Expose()
  @IsString()
  text: string;
  @Expose()
  @IsString()
  error: string;
}
