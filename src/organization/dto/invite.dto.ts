import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

@Exclude()
export default class InviteDto {
  @Expose()
  @IsString()
  @IsEmail()
  @MaxLength(100)
  email: string;
}
