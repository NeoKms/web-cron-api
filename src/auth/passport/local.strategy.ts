import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private authService: AuthService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
      allowEmptyPasswords: false,
    });
  }

  async validate(
    req: XMLHttpRequest & { body: any },
    username: string,
    password: string,
  ): Promise<any> {
    const user = await this.authService.login(username, password, req);
    if (user === -1) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.ban_login', {
          args: { time: 3 + ' ' + this.i18n.t('auth.time.hour') },
        }),
      );
    } else if (user === -2) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.ban_login', {
          args: { time: 1 + ' ' + this.i18n.t('auth.time.day') },
        }),
      );
    } else if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.wrong_login_or_password'),
      );
    }
    return user;
  }
}
