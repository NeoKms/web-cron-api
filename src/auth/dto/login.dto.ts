import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@Exclude()
export class LoginDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  username: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(100)
  inviteCode?: string;
}
