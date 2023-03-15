import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import Sentry from '@sentry/node';

const logger = new Logger();

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private sentryKey: string = null;

  public httpAdapterHost: HttpAdapterHost = null;

  setHttpAdapterHost(httpAdapterHost) {
    this.httpAdapterHost = httpAdapterHost;
  }

  setSentry(sentryKey) {
    if (sentryKey) {
      this.sentryKey = sentryKey;
      logger.debug('sentry was init');
    }
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = {
      service: 'AUTH_NEST_API',
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
