import { Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { User } from '../entities/user.entity';
import { hashPassword, transliterate } from '../../helpers/constants';
import RightsDto from '../../auth/dto/rights.dto';

@Exclude()
export class CreateUserDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  surname: string;

  @Expose()
  @IsString()
  @IsOptional()
  secondname?: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Expose()
  @IsOptional()
  @IsObject()
  @Type(() => RightsDto)
  rights: RightsDto;

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
    it.phone = this.phone;
    it.login = `${transliterate(this.surname)}.${transliterate(this.name)}`;
    it.password_hash = hashPassword(
      Math.floor(Math.random() * 100000000 + 1).toString(),
    );
    return it;
  }
}
