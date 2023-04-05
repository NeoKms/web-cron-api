import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import SentryModule from './helpers/sentry';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './helpers/all-exceptions.filter';
import { RedisService } from 'nestjs-redis';
import { Logger } from '@nestjs/common';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from './i18n/i18n.generated';

process.on('uncaughtException', (err) => {
  const logger = new Logger();
  logger.error(err, 'uncaughtException');
});
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const i18n: I18nService<I18nTranslations> = app.get(I18nService);

  SentryModule(app);

  const filter = new AllExceptionsFilter(i18n);
  filter.setHttpAdapterHost(app.get(HttpAdapterHost));
  filter.setSentry(configService.get('SENTRY'));

  const redisClient = app.get(RedisService).getClient();
  const sessConf = configService.get('SESSION');
  app.enableCors((req, callback) => {
    const corsOpt = {
      credentials: true,
      origin: req.headers.origin || '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    };
    callback(null, corsOpt);
  });
  const logger = new Logger();
  app
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json({ limit: '30mb' }))
    .use(cookieParser())
    .use(
      morgan(
        ':remote-addr :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" - :response-time ms',
        {
          stream: {
            write: function (str) {
              logger.log(str, 'Входящий запрос');
            },
          },
        },
      ),
    )
    .use(
      session({
        secret: sessConf.secret,
        resave: true,
        saveUninitialized: false,
        rolling: true,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: false,
          sameSite: 'lax',
          domain: sessConf.cookie_domain,
        },
        store: new RedisStore({ client: redisClient }),
      }),
    )
    .use(passport.initialize())
    .use(passport.session())
    .use((req, res, next) => {
      req.sentryContext = { tags: {}, breadcrumbs: [] };
      next();
    });

  if (!configService.get('PRODUCTION')) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle(i18n.t('main.doc.title'))
        .setDescription(i18n.t('main.doc.description'))
        .setVersion('1.0')
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(configService.get('PORT')).then((app) =>
    logger.verbose(
      i18n.t('main.messages.server_port', {
        args: { port: app.address().port },
      }),
      'NestApplication',
    ),
  );
}
bootstrap().then().catch();
