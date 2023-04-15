import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { User } from '../entities/user.entity';
import { hashPassword } from '../../helpers/constants';
import RightsDto from '../../auth/dto/rights.dto';

@Exclude()
export class CreateUserDto {
  @Expose()
  @IsString()
  @IsDefined()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @Expose()
  @IsString()
  @IsDefined()
  @MinLength(2)
  @MaxLength(100)
  surname: string;

  @Expose()
  @IsString()
  @IsOptional()
  @IsDefined()
  @MinLength(2)
  @MaxLength(100)
  secondname?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone?: string;

  @Expose()
  @IsString()
  @IsDefined()
  @MinLength(4)
  @MaxLength(25)
  password: string;

  @Expose()
  @Type(() => RightsDto)
  @IsOptional()
  @IsDefined()
  @ValidateNested()
  @IsObject()
  rights: RightsDto;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @Expose()
  public fio(): string {
    return `${this.surname} ${this.name}${
      this.secondname ? ' ' + this.secondname : ''
    }`;
  }

  public toEntity(): User {
    const it = new User({});
    if (this.rights) {
      it.rights = this.rights;
    }
    it.fio = this.fio();
    if (this.phone) {
      it.phone = this.phone;
    }
    it.email = this.email;
    it.password_hash = hashPassword(this.password);
    return it;
  }
}
