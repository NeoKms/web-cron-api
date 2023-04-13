import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export default class UpdateOrgDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;
}
