import { ExecutionContext, Injectable } from '@nestjs/common';
import { LoggedInGuard } from './logged-in.guard';
import { Reflector } from '@nestjs/core';
import { ReqWithUser } from '../../helpers/interfaces/req';
import { RightObject } from './rights.decorator';
import { rights } from '../../helpers/constants';
import { RedisService } from 'nestjs-redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RightsGuard extends LoggedInGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly configServiceY: ConfigService,
    private readonly redisServiceY: RedisService,
  ) {
    super(configServiceY, redisServiceY);
  }

  async canActivate(context: ExecutionContext) {
    if (context.getType() === 'http') {
      const req: ReqWithUser = context.switchToHttp().getRequest();
      const checkRight = this.reflector.get<RightObject[]>(
        'rights',
        context.getHandler(),
      );
      const isAuth = await super.canActivate(context);
      let rightsSuccess = true;
      if (checkRight.length) {
        rightsSuccess = checkRight.some(
          (rightObj) =>
            req?.user?.rights[rightObj.entity] >= rights[rightObj.level],
        );
      }
      return isAuth && rightsSuccess;
    } else {
      return false;
    }
  }
}
