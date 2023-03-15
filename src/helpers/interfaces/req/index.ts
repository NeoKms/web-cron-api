import { Request } from 'express';
import { ResponseUserDto } from '../../../user/dto/response-user.dto';
import { SimpleObject } from '../common';

export interface ReqWithUser extends Request {
  user: ResponseUserDto;
  sentryContext: { tags: SimpleObject; breadcrumbs: any[] };
  logout: (cb) => void;
}
