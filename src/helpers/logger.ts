import { ConsoleLogger } from '@nestjs/common';
import config from '../config';
import * as Sentry from '@sentry/node';
export class Logger extends ConsoleLogger {
  error(exception: Error | string, message?: string, context?: string) {
    const err: Error =
      typeof exception === 'string' ? new Error(exception) : exception;
    if (config().SENTRY) {
      Sentry.captureException(err);
    }
    super.error(err.message, err.stack, context);
  }
}
