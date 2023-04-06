import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { RedisService } from 'nestjs-redis';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import config from '../src/config';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const configService = app.get(ConfigService);
    const redisClient = app.get(RedisService).getClient();
    const sessConf = configService.get('SESSION');
    app
      .use(bodyParser.urlencoded({ extended: true }))
      .use(bodyParser.json({ limit: '30mb' }))
      .use(cookieParser())
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
    await app.init();
  });

  describe('authController', () => {
    it(`[failed][GET] auth/checkLogin`, () => {
      return request(app.getHttpServer()).get('/auth/checkLogin').expect(403);
    });
    const authCookieHeader = {
      cookie: 'authCookie',
    };
    const mocUserLogin = {
      username: 'admin',
      password: 'admin',
    };
    const mocUserLoginFailed = {
      username: 'admin',
      password: 'admin2',
    };
    it(`[failed][POST] auth/login`, () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(mocUserLoginFailed)
        .expect(404);
    });
    it(`[POST] auth/login`, () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(mocUserLogin)
        .expect(200)
        .then((response) => {
          const resp = response.body;
          expect(resp).toHaveProperty('message');
          expect(resp).toHaveProperty('result');
          expect(resp.message).toBe('ok');
          const result = resp.result;
          expect(result.login).toBe('admin');
          expect(response.headers).toHaveProperty('set-cookie');
          expect(response.headers['set-cookie']).toHaveLength(1);
          const [ck] = response.headers['set-cookie'][0].split('=');
          expect(ck).toBe(config().SESSION.key);
          authCookieHeader.cookie = response.headers['set-cookie'][0];
        });
    });
    it(`[GET] auth/checkLogin`, () => {
      return request(app.getHttpServer())
        .get('/auth/checkLogin')
        .set(authCookieHeader)
        .expect(200)
        .then((response) => {
          const resp = response.body;
          expect(resp).toHaveProperty('message');
          expect(resp).toHaveProperty('result');
          expect(resp.message).toBe('ok');
          const result = resp.result;
          expect(result.login).toBe('admin');
        });
    });

    it(`[GET] auth/logout`, () => {
      return request(app.getHttpServer())
        .get('/auth/logout')
        .set(authCookieHeader)
        .expect(200)
        .then((response) => {
          const resp = response.body;
          expect(resp).toHaveProperty('message');
          expect(resp.message).toBe('ok');
        });
    });
    it(`[failed][GET] auth/checkLogin`, () => {
      return request(app.getHttpServer()).get('/auth/checkLogin').expect(403);
    });
  });

  afterAll(async () => {
    app && (await app.close());
  });
});
