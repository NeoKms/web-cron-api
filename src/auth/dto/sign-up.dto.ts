import { Exclude, Expose } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { hashPassword } from '../../helpers/constants';
import { CreateUserDto } from '../../user/dto/create-user.dto';

@Exclude()
export class SignUpDto extends CreateUserDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  verifyKey: string;
  @Expose()
  @IsDefined()
  @IsPositive()
  code: number;

  public toEntity(): User {
    const it = new User({});
    it.fio = this.fio();
    if (this.phone) {
      it.phone = this.phone;
    }
    it.email = this.email;
    it.password_hash = hashPassword(this.password);
    return it;
  }
}
