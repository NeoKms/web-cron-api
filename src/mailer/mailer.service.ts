import { Injectable } from '@nestjs/common';
import { Logger } from '../helpers/logger';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter = null;
  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly configService: ConfigService,
  ) {
    const auth = {
      user: this.configService.get('GMAIL.LOGIN') || false,
      pass: this.configService.get('GMAIL.KEY') || false,
    };
    if (auth.user !== false && auth.pass !== false) {
      this.logger.verbose(this.i18n.t('mailer.messages.ready'));
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth,
      });
    } else {
      this.logger.verbose(this.i18n.t('mailer.errors.not_ready'));
    }
  }
  async waitVerify(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (this.transporter === null) {
        resolve(false);
      }
      this.transporter.verify((error): void => {
        if (error) {
          this.logger.error(
            error.message,
            this.i18n.t('mailer.errors.cant_verify'),
          );
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async sendEmail(to, subject, text): Promise<boolean> {
    if (this.configService.get('IS_TEST'))
      return new Promise((resolve) => resolve(false));
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return this.waitVerify()
      .then(
        () =>
          new Promise<boolean>((resolve) => {
            if (this.transporter === null) {
              resolve(false);
            } else {
              this.transporter.sendMail(
                {
                  to,
                  subject,
                  html: text,
                },
                function (err) {
                  if (err) {
                    self.logger.error(err.message);
                    resolve(false);
                  } else {
                    resolve(true);
                  }
                },
              );
            }
          }),
      )
      .catch(() => false);
  }
}
