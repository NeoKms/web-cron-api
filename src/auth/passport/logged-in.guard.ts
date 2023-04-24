import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'nestjs-redis';
import * as Redis from 'ioredis';

@Injectable()
export class LoggedInGuard implements CanActivate {
  private readonly redisClient: Redis.Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.redisClient = redisService.getClient();
  }

  async canActivate(context: ExecutionContext) {
    if (context.getType() === 'http') {
      if (context.switchToHttp().getRequest().isAuthenticated()) {
        return true;
      } else {
        throw new UnauthorizedException();
      }
    } else {
      return false;
    }
  }
}
