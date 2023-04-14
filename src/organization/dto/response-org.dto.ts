import { IsNumber, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export default class ResponseOrgDto {
  @Expose()
  @IsNumber()
  id: number;
  @Expose()
  @IsString()
  name: string;
  @IsNumber()
  @Expose()
  created_at: number;
  @IsNumber()
  @Expose()
  ownerUserEntityId: number;
}
