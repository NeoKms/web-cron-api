import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'nestjs-redis';
import {
  getNowTimestampSec,
  hashCode,
  hashPassword,
} from '../helpers/constants';
import { plainToClass } from 'class-transformer';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import * as Redis from 'ioredis';
import { ReqWithUser } from '../helpers/interfaces/req';
import { Logger } from '../helpers/logger';
import { MailerService } from '../mailer/mailer.service';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly redisClient: Redis.Redis;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailerService: MailerService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    this.redisClient = redisService.getClient();
  }
  async deleteAllRedisSessionByUserId(id: number): Promise<void> {
    await this.redisClient
      .keys('sess:*')
      .then(async (keys) =>
        Promise.all(
          keys.map((el) =>
            this.redisClient.get(el).then((res) => [el, JSON.parse(res)]),
          ),
        ),
      )
      .then((keysData) =>
        keysData.filter((session) => session[1]?.passport?.user?.id === id),
      )
      .then((keysData) =>
        Promise.all(
          keysData.map((session) => this.redisClient.del(session[0])),
        ),
      )
      .catch((err) => this.logger.error(err));
  }

  async sendCode(email: string): Promise<string> {
    const verifyKey = hashCode(email + Date.now().toString()).toString();
    const code = Math.floor(Math.random() * 100000000 + 1).toString();
    const cantRetryKey = email + '_retry';
    const nowTs = getNowTimestampSec();
    const cantRetry = await this.redisClient.get(cantRetryKey);
    if (cantRetry) {
      throw new BadRequestException(
        this.i18n.t('auth.errors.send_code_retry', {
          args: { sec: parseInt(cantRetry) - nowTs },
        }),
      );
    } else {
      await this.redisClient.set(cantRetryKey, nowTs + 60, 'EX', 60);
    }
    await this.redisClient.set(verifyKey, code, 'EX', 20 * 60);
    const sent = await this.mailerService.sendEmail(
      email,
      this.i18n.t('mailer.email_templates.send_code.subject'),
      this.i18n.t('mailer.email_templates.send_code.text', { args: { code } }),
    );
    console.log(sent, 'sent');
    if (!sent) {
      throw new InternalServerErrorException(
        this.i18n.t('mailer.errors.cant_send'),
      );
    }
    await this.redisClient.set(verifyKey, code, 'EX', 20 * 60);
    return verifyKey;
  }
  async login(
    username: string,
    password: string,
    req,
  ): Promise<ResponseUserDto | null | -1 | -2> {
    let result = null;
    this.logger.log('login: ' + username);
    req.sentryContext.breadcrumbs.push({ f: 'login username', v: username });
    const user = await this.userService.findOne({ login: username });
    user.login_cnt = user.login_cnt + 1;
    if (user.password_hash === hashPassword(password.toString())) {
      user.login_timestamp = getNowTimestampSec();
      user.login_cnt = 0;
      user.banned_to = 0;
      result = plainToClass(ResponseUserDto, user);
      this.deleteAllRedisSessionByUserId(user.id);
    }
    if (user.login_cnt >= 5) {
      const isFirst = user.banned_to === 0;
      const timer = isFirst ? 3600 * 3 : 86400;
      user.banned_to = getNowTimestampSec() + timer;
      result = isFirst ? -1 : -2;
    }
    await this.userService.updateInternal(user.id, user);
    return result;
  }

  async logout(req: ReqWithUser): Promise<void> {
    req.logout(() => {
      return null;
    });
  }

  async checkLogin(user: ResponseUserDto): Promise<ResponseUserDto> {
    const userInDb = await this.userService.findOne({ id: user.id });
    if (!userInDb.orgEntities.find((org) => org.id === user.orgSelectedId)) {
      user.orgSelectedId = userInDb.orgSelectedId;
    }
    user.orgEntities = userInDb.orgEntities;
    user.rights = userInDb.rights;
    return user;
  }
}
