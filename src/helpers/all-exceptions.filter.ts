import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import Sentry from '@sentry/node';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private sentryKey: string = null;
  public httpAdapterHost: HttpAdapterHost = null;
  private readonly i18n: I18nService<I18nTranslations> = null;
  private readonly logger = new Logger();

  constructor(i18n: I18nService<I18nTranslations>) {
    super();
    this.i18n = i18n;
  }
  setHttpAdapterHost(httpAdapterHost) {
    this.httpAdapterHost = httpAdapterHost;
  }

  setSentry(sentryKey) {
    if (sentryKey) {
      this.sentryKey = sentryKey;
      this.logger.verbose(
        this.i18n.t('main.messages.sentry'),
        'NestApplication',
      );
    }
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = {
      service: process.env.npm_package_name,
      timestamp: new Date().toISOString().replace('T', ' ').replace('Z', ''),
      route: '',
      statusCode: httpStatus,
      exception: {
        message: exception.message,
        obj: exception,
      },
    };
    if (host.getType() === 'http') {
      const { httpAdapter } = this.httpAdapterHost;
      const ctx = host.switchToHttp();
      const req = ctx.getRequest();
      responseBody.route = httpAdapter.getRequestUrl(req);
      if (this.sentryKey) {
        Sentry.captureException(exception, (scope) => {
          if (Object.keys(req.sentryContext.tags).length) {
            for (const [tagName, tagValue] of Object.entries(
              req.sentryContext.tags,
            )) {
              scope.setTag(tagName, tagValue as string);
            }
          }
          if (req.sentryContext.breadcrumbs.length) {
            for (const bread of req.sentryContext.breadcrumbs) {
              scope.addBreadcrumb({
                category: bread.f,
                message: bread.v,
                level: 'info',
              });
            }
          }
          scope.setUser(req.user);
          scope.setTransactionName(httpAdapter.getRequestUrl(req));
          return scope;
        });
      }
      super.catch(exception, host);
    } else if (host.getType() === 'rpc') {
      const routeArray = host
        .switchToRpc()
        .getContext()
        .internalRepr.get('route');
      responseBody.route =
        'rpc:' + routeArray.length ? routeArray[0] : 'no/valid/route';
      if (this.sentryKey) {
        Sentry.captureException(exception);
      }
    }
  }
}
