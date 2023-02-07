import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

export default (app, dsn, prod = false) => {
  if (dsn !== false) {
    Sentry.init({
      environment: prod ? 'production' : 'develop',
      dsn,
      integrations: [
        new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
        new Tracing.Integrations.Express({ app }),
      ],
      tracesSampleRate: 0.3,
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }
};
