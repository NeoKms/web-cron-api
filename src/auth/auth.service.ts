import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'nestjs-redis';
import { getNowTimestampSec, hashPassword, md5 } from '../helpers/constants';
import { plainToClass } from 'class-transformer';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import * as Redis from 'ioredis';
import { ReqWithUser } from '../helpers/interfaces/req';
import { Logger } from '../helpers/logger';
import { MailerService } from '../mailer/mailer.service';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from '../user/entities/user.entity';
import { InviteCodeData } from '../helpers/interfaces/common';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPassRedisData } from '../helpers/interfaces/auth';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly redisClient: Redis.Redis;
  private readonly VerifyKeyByEmail = new Map();

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

  private generateCode() {
    if (this.configService.get('IS_TEST')) return '1';
    else return Math.floor(Math.random() * 100000000 + 1).toString();
  }
  async sendCode(email: string): Promise<string> {
    const verifyKey = md5(email + Date.now().toString());
    const code = this.generateCode();
    const cantRetryKey = email + '_retry';
    const nowTs = getNowTimestampSec();
    const cantRetry = await this.redisClient.get(cantRetryKey);
    if (cantRetry && !this.configService.get('PRODUCTION')) {
      throw new BadRequestException(
        this.i18n.t('auth.errors.send_code_retry', {
          args: { sec: parseInt(cantRetry) - nowTs },
        }),
      );
    } else {
      await this.redisClient.set(cantRetryKey, nowTs + 60, 'EX', 60);
    }
    const isExistEmail = await this.userService.findOne({
      email,
      onlyActive: null,
      withoutError: true,
    });
    if (isExistEmail) {
      return verifyKey;
    }
    this.VerifyKeyByEmail.set(email, verifyKey);
    await this.redisClient.set(verifyKey, code, 'EX', 20 * 60);
    this.mailerService.sendEmail(
      email,
      this.i18n.t('mailer.email_templates.send_code.subject'),
      this.i18n.t('mailer.email_templates.send_code.text', { args: { code } }),
    );
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
    const user = await this.userService.findOne({
      email: username,
      withoutError: true,
    });
    if (!user) return null;
    const userToUpd = new User({ id: user.id });
    userToUpd.login_cnt = user.login_cnt + 1;
    if (user.password_hash === hashPassword(password.toString())) {
      userToUpd.login_timestamp = getNowTimestampSec();
      userToUpd.login_cnt = 0;
      userToUpd.banned_to = 0;
      result = plainToClass(ResponseUserDto, user);
      this.deleteAllRedisSessionByUserId(user.id);
    }
    if (userToUpd.login_cnt >= 5) {
      const isFirst = userToUpd.banned_to === 0;
      const timer = isFirst ? 3600 * 3 : 86400;
      userToUpd.banned_to = getNowTimestampSec() + timer;
      result = isFirst ? -1 : -2;
    }
    await this.userService.updateInternal(user.id, userToUpd);
    const { inviteCode } = req.body;
    if (result instanceof ResponseUserDto && inviteCode) {
      const inviteCodeData = await this.redisClient
        .get(inviteCode)
        .then((res) => {
          if (res) {
            return JSON.parse(res) as InviteCodeData;
          } else {
            return false;
          }
        });
      if (inviteCodeData !== false && result.email === inviteCodeData.email) {
        await this.userService.acceptInviteCode(result, inviteCodeData.orgId);
        await this.redisClient.del(inviteCode);
      }
    }
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
    user.fio = userInDb.fio;
    return user;
  }

  async signUp(dto: SignUpDto) {
    const code = await this.redisClient.get(dto.verifyKey);
    const VerifyKeyByEmail = this.VerifyKeyByEmail.get(dto.email);
    if (VerifyKeyByEmail !== dto.verifyKey || !code || +code !== dto.code) {
      throw new BadRequestException(this.i18n.t('auth.errors.code_error'));
    }
    await this.userService.create(dto, null);
    await this.redisClient.del(dto.verifyKey);
    this.mailerService
      .sendEmail(
        dto.email,
        this.i18n.t('mailer.email_templates.sign_up.subject'),
        this.i18n.t('mailer.email_templates.sign_up.text', {
          args: {
            fio: dto.fio(),
            login: dto.email,
            password: dto.password,
          },
        }),
      )
      .catch(() => null);
  }

  async resetPass(dto: ResetPasswordDto): Promise<null | string> {
    if (dto.verifyCode) {
      const data = await this.redisClient
        .get(dto.verifyCode)
        .then((res) =>
          !!res ? (JSON.parse(res) as ResetPassRedisData) : null,
        );
      if (!data) {
        throw new BadRequestException(this.i18n.t('auth.errors.reset_pass'));
      }
      await this.redisClient.del(dto.verifyCode);
      const user = await this.userService.findOne({ email: data.email });
      if (!user) {
        throw new BadRequestException(this.i18n.t('auth.errors.reset_pass'));
      }
      const newPass = md5(Date.now().toString()).slice(0, 10);
      await this.userService.updateInternal(
        user.id,
        new User({
          password_hash: hashPassword(newPass),
        }),
      );
      this.deleteAllRedisSessionByUserId(user.id);
      this.mailerService.sendEmail(
        data.email,
        this.i18n.t('mailer.email_templates.reset_pass_success.subject'),
        this.i18n.t('mailer.email_templates.reset_pass_success.text', {
          args: {
            pass: newPass,
          },
        }),
      );
      return data.redirect;
    } else if (dto.email) {
      const user = await this.userService.findOne({
        email: dto.email,
        withoutError: true,
      });
      if (!user) return;
      const cantRetryKey = dto.email + '_retry';
      const cantRetry = await this.redisClient.get(cantRetryKey);
      const nowTs = getNowTimestampSec();
      if (cantRetry && !this.configService.get('PRODUCTION')) {
        throw new BadRequestException(
          this.i18n.t('auth.errors.send_code_retry', {
            args: { sec: parseInt(cantRetry) - nowTs },
          }),
        );
      } else {
        await this.redisClient.set(cantRetryKey, nowTs + 60, 'EX', 60);
      }
      const verifyCode = md5(dto.email + Date.now().toString());
      await this.redisClient.set(
        verifyCode,
        JSON.stringify({
          email: dto.email,
          redirect: dto.redirect ?? null,
        } as ResetPassRedisData),
        'EX',
        60 * 15,
      );
      const link = `${this.configService.get(
        'SELF_DOMAIN',
      )}/auth/password/reset?verifyCode=${verifyCode}`;
      this.mailerService.sendEmail(
        dto.email,
        this.i18n.t('mailer.email_templates.reset_pass.subject'),
        this.i18n.t('mailer.email_templates.reset_pass.text', {
          args: {
            link,
          },
        }),
      );
      return null;
    }
  }

  async changePass(
    dto: ChangePasswordDto,
    user: ResponseUserDto,
  ): Promise<void> {
    if (dto.new !== dto.newTwice) {
      throw new BadRequestException(
        this.i18n.t('auth.errors.change_pass_check'),
      );
    }
    const userExist = await this.userService.findOne({ id: user.id });
    if (hashPassword(dto.current) !== userExist.password_hash) {
      throw new BadRequestException(this.i18n.t('auth.errors.change_pass_now'));
    }
    await this.userService.updateInternal(
      user.id,
      new User({
        password_hash: hashPassword(dto.new),
      }),
    );
    this.mailerService.sendEmail(
      user.email,
      this.i18n.t('mailer.email_templates.reset_pass_success.subject'),
      this.i18n.t('mailer.email_templates.reset_pass_success.text', {
        args: {
          pass: dto.new,
        },
      }),
    );
  }
}
