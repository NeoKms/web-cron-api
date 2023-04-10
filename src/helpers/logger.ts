import { ConsoleLogger } from '@nestjs/common';
import config from '../config';
import * as Sentry from '@sentry/node';
export class Logger extends ConsoleLogger {
  log(message: any, context?: string) {
    if (process.env.NODE_ENV === 'test') return;
    context ? super.log(message, context) : super.log(message);
  }
  debug(message: any, context?: string) {
    if (process.env.NODE_ENV === 'test') return;
    context ? super.debug(message, context) : super.debug(message);
  }
  error(exception: Error | string, message = '', context?: string) {
    if (process.env.NODE_ENV === 'test') return;
    const err: Error =
      typeof exception === 'string' ? new Error(exception) : exception;
    if (message) {
      err.message = `[${message}]${err.message}`;
    }
    if (config().SENTRY) {
      Sentry.captureException(err);
    }
    const errMsg = message ? `[${message}] ${err.stack}` : err.stack;
    context ? super.error(errMsg, context) : super.error(errMsg);
  }
}
