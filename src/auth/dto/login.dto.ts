import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString, Max } from 'class-validator';

@Exclude()
export class LoginDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @Max(100)
  username: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @Max(100)
  password: string;
}
