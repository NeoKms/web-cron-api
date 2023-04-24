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
export class ChangePasswordDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  current: string;
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  new: string;
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  newTwice: string;
}
