import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RightsGuard } from './rights.guard';
import { rightsType } from '../../helpers/constants';
import RightsDto from '../dto/rights.dto';
export type RightObject = {
  entity: keyof RightsDto;
  level: keyof rightsType;
};
export const Rights = (...rights: RightObject[]) => {
  return applyDecorators(UseGuards(RightsGuard), SetMetadata('rights', rights));
};
