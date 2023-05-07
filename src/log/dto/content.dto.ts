import { Exclude, Expose } from 'class-transformer';
import { IsDefined, IsNumber, IsString } from 'class-validator';

@Exclude()
export class ContentDto {
  @Expose()
  @IsString()
  @IsDefined()
  text: string;
  @Expose()
  @IsString()
  @IsDefined()
  error: string;
}
