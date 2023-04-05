import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import config from '../config';

export default (app) => {
  if (config().SENTRY !== false) {
    Sentry.init({
      environment: config().PRODUCTION ? 'production' : 'develop',
      dsn: config().SENTRY as string,
      integrations: [
        new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
        new Tracing.Integrations.Express({ app }),
      ],
      tracesSampleRate: 1,
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }
};
