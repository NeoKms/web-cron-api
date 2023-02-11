import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import SentryModule from './helpers/sentry';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './helpers/all-exceptions.filter';
import { RedisService } from 'nestjs-redis';
import { Logger } from '@nestjs/common';
import * as session from 'express-session';
import * as RedisStore from 'connect-redis';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';

process.on('uncaughtException', (err) => {
  const logger = new Logger();
  logger.error(err, 'uncaughtException');
});
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  SentryModule(
    app,
    configService.get('SENTRY'),
    configService.get('PRODUCTION'),
  );

  const filter = new AllExceptionsFilter();
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
        store: new (RedisStore(session))({
          logErrors: true,
          client: redisClient,
        }),
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
        .setTitle('Документация к системе')
        .setDescription('API для работы веб интерфейса крона')
        .setVersion('1.0')
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }

  await app
    .listen(configService.get('PORT'))
    .then((app) =>
      logger.debug(
        `Сервер запущен на порту ${app.address().port}`,
        'NestApplication',
      ),
    );
}
bootstrap();
