import { ConsoleLogger } from '@nestjs/common';
import config from '../config';
import * as Sentry from '@sentry/node';
export class Logger extends ConsoleLogger {
  log(message: any, context?: string) {
    if (process.env.NODE_ENV === 'test') return;
    super.log(message, context);
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV === 'test') return;
    super.debug(message, context);
  }

  error(exception: Error | string, message?: string, context?: string) {
    if (process.env.NODE_ENV === 'test') return;
    const err: Error =
      typeof exception === 'string' ? new Error(exception) : exception;
    if (config().SENTRY) {
      Sentry.captureException(err);
    }
    super.error(err.message, err.stack, context);
  }
}
