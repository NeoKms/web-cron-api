import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
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
      return context.switchToHttp().getRequest().isAuthenticated();
    } else {
      return false;
    }
  }
}
