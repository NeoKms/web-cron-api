import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

@Exclude()
export class LoginDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  username: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  password: string;
}
