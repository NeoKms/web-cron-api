import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@Exclude()
export class ResetPasswordDto {
  @Expose()
  @IsString()
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;
  @Expose()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  verifyCode?: string;
  @Expose()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  redirect?: string;
}
