import { Exclude, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

@Exclude()
export default class PaginationDto {
  @Expose()
  @IsOptional()
  @IsDefined()
  @IsString({ each: true })
  public groupBy?: Array<string>;
  @Expose()
  @IsNumber()
  @IsPositive()
  @IsDefined()
  public itemsPerPage: number;
  @Expose()
  @IsNumber()
  @IsPositive()
  @IsDefined()
  public page: number;
  @Expose()
  @IsOptional()
  @IsDefined()
  @IsString({ each: true })
  public sortBy?: Array<string>;
  @Expose()
  @IsDefined()
  @IsOptional()
  @IsBoolean({ each: true })
  public sortDesc?: Array<boolean>;
}
