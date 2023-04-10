import { Exclude, Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

@Exclude()
export default class PaginateDto {
  @Expose()
  @IsNumber()
  public all: number;
  @Expose()
  @IsNumber()
  public page: number;
  @Expose()
  @IsNumber()
  public itemsPerPage: number;
}
