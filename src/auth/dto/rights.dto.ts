import { Exclude, Expose } from 'class-transformer';
import { IsDefined, IsNumber, IsOptional, Max, Min } from 'class-validator';

@Exclude()
export default class RightsDto {
  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsDefined()
  logs?: number;
  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsDefined()
  jobs?: number;
  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsDefined()
  users?: number;
  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsDefined()
  ssh?: number;
}
