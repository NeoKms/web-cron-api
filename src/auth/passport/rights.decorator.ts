import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RightsGuard } from './rights.guard';
import { rightsType } from '../../helpers/constants';
export type RightObject = {
  entity: string;
  level: keyof rightsType;
};
export const Rights = (...rights: RightObject[]) => {
  return applyDecorators(UseGuards(RightsGuard), SetMetadata('rights', rights));
};
