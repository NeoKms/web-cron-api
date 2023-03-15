import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsPositive, IsString } from 'class-validator';

@Exclude()
export default class PaginationDto {
  @Expose()
  @IsString({ each: true })
  public groupBy: Array<string>;
  @Expose()
  @IsBoolean({ each: true })
  public groupDesc: Array<boolean>;
  @Expose()
  @IsNumber()
  @IsPositive()
  public itemsPerPage: number;
  @Expose()
  @IsNumber()
  @IsPositive()
  public page: number;
  @Expose()
  @IsString({ each: true })
  public sortBy: Array<string>;
  @Expose()
  @IsBoolean({ each: true })
  public sortDesc: Array<boolean>;
}
