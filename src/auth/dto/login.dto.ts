import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class LoginDto {
  @Expose()
  @IsString()
  username: string;

  @Expose()
  @IsString()
  password: string;
}
