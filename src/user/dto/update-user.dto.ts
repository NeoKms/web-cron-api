import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { User } from '../entities/user.entity';
import RightsDto from '../../auth/dto/rights.dto';

@Exclude()
export class UpdateUserDto {
  @Expose()
  @Type(() => RightsDto)
  @IsOptional()
  @IsDefined()
  @ValidateNested()
  @IsObject()
  public rights?: RightsDto;

  @Expose()
  @IsString()
  @IsOptional()
  @IsDefined()
  @MinLength(2)
  @MaxLength(100)
  public name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @IsDefined()
  @MinLength(2)
  @MaxLength(100)
  public surname?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  public secondname?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  public phone?: string;

  @Expose()
  public fio(): string | null {
    if (!this.surname && !this.name) return null;
    let fio = this.surname + ' ' + this.name;
    if (this.secondname) {
      fio += ' ' + this.secondname;
    }
    return fio.trim();
  }

  public toEntity(id: number) {
    const entity: User = new User({ id });
    if (this.fio()) {
      entity.fio = this.fio();
    }
    if (this.phone) {
      entity.phone = this.phone;
    }
    return new User(entity);
  }
}
