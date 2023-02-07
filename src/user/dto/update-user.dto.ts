import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import User from '../entities/user.entity';
import RightsDto from '../../auth/dto/rights.dto';

@Exclude()
export class UpdateUserDto {
  @Expose()
  @Type((type) => RightsDto)
  @IsOptional()
  public rights?: RightsDto;

  @Expose()
  @IsString()
  @IsOptional()
  public name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  public surname?: string;

  @Expose()
  @IsString()
  @IsOptional()
  public secondname?: string;

  @Expose()
  @IsString()
  @IsOptional()
  public phone?: string;

  @Expose()
  public fio(): string | null {
    if (!this.surname && !this.name) return null;
    let fio = this.surname + ' ' + this.name;
    if (this.secondname) {
      fio += ' ' + this.secondname;
    }
    return fio;
  }

  public toEntity(id: number) {
    const entity: User = new User({ id });
    if (this.fio()!) {
      entity.fio = this.fio();
    }
    if (this.rights) {
      entity.rights = this.rights;
    }
    if (this.phone) {
      entity.phone = this.phone;
    }
    return new User(entity);
  }
}
