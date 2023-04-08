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
import { copyObj, defaultRights, sleep } from '../src/helpers/constants';
import conDs from '../src/config/ormconfig';
import * as fs from 'fs';
import * as process from 'process';

let rootConnection = null;
const testDbName = `test_${Date.now()}`;
const checkBody = (body, withResult = true) => {
  expect(body).toHaveProperty('message');
  withResult && expect(body).toHaveProperty('result');
  expect(body.message).toBe('ok');
  return body.result;
};
const checkCookie = (response) => {
  expect(response.headers).toHaveProperty('set-cookie');
  expect(response.headers['set-cookie']).toHaveLength(1);
  const [ck] = response.headers['set-cookie'][0].split('=');
  expect(ck).toBe(config().SESSION.key);
  authCookieHeader.cookie = response.headers['set-cookie'][0];
};
const clearTestDb = async () => {
  rootConnection = await conDs.initialize();
  await rootConnection.query(`create database ${testDbName}`);
  if (process.env.NODE_ENV === 'test') {
    process.env.DB_NAME = testDbName;
  }
};
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
const mocUserCreate = {
  id: null,
  name: 'test',
  surname: 'test',
  secondname: 'test',
  phone: '79999999999',
  password: '123456',
  rights: copyObj(defaultRights),
  login: 'test.test',
};
const mocUserAuthFailed = {
  username: mocUserCreate.login,
  password: mocUserCreate.password + '1',
};
const mocSshCreate = {
  id: null,
  host: process.env.TEST_HOST,
  port: +process.env.TEST_PORT,
  username: process.env.TEST_USERNAME,
  description: 'test',
};
const mocJobCreate = {
  id: null,
  sshEntityId: 1,
  job: 'ls ~',
  time: {
    minute: {
      value: 1,
      period: true,
    },
    hour: {
      value: -1,
      period: false,
    },
    day: {
      value: -1,
      period: false,
    },
    month: {
      value: -1,
      period: false,
    },
    weekDay: {
      value: -1,
      period: false,
    },
  },
};
describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await clearTestDb();
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
    it(`[failed][POST] auth/login`, async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(mocUserLoginFailed)
        .expect(401);
    });
    it(`[POST] auth/login`, () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(mocUserLogin)
        .expect(200)
        .then((response) => {
          const result = checkBody(response.body);
          expect(result.login).toBe('admin');
          checkCookie(response);
        });
    });
    it(`[GET] auth/checkLogin`, () => {
      return request(app.getHttpServer())
        .get('/auth/checkLogin')
        .set(authCookieHeader)
        .expect(200)
        .then(({ body }) => {
          const result = checkBody(body);
          expect(result.login).toBe('admin');
        });
    });
    it(`[GET] auth/logout`, () => {
      return request(app.getHttpServer())
        .get('/auth/logout')
        .set(authCookieHeader)
        .expect(200)
        .then(({ body }) => checkBody(body, false));
    });
    it(`[failed][GET] auth/checkLogin`, () => {
      return request(app.getHttpServer()).get('/auth/checkLogin').expect(403);
    });
  });

  describe('userController', () => {
    describe('[user] Create/Update/Read', () => {
      it(`[POST] auth/login`, () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(mocUserLogin)
          .expect(200)
          .then((response) => {
            const result = checkBody(response.body);
            expect(result.login).toBe('admin');
            checkCookie(response);
          });
      });
      it(`[POST] user`, () => {
        return request(app.getHttpServer())
          .post('/user')
          .set(authCookieHeader)
          .send(mocUserCreate)
          .expect(201)
          .then(({ body }) => {
            const result = checkBody(body);
            expect(result.login).toBe(mocUserCreate.login);
          });
      });
      it(`[failed][POST] user`, () => {
        return request(app.getHttpServer())
          .post('/user')
          .set(authCookieHeader)
          .send(mocUserCreate)
          .expect(400);
      });
      it(`[GET] user`, () => {
        return request(app.getHttpServer())
          .get('/user')
          .set(authCookieHeader)
          .expect(200)
          .then(({ body }) => {
            const result = checkBody(body);
            const ind = result.findIndex(
              (e) => e.login === mocUserCreate.login,
            );
            expect(ind).not.toBe(-1);
            mocUserCreate.id = result[ind].id;
          });
      });
      it(`[GET] user/:id`, () => {
        return request(app.getHttpServer())
          .get('/user/' + mocUserCreate.id)
          .set(authCookieHeader)
          .expect(200)
          .then(({ body }) => {
            const result = checkBody(body);
            expect(result.login).toBe(mocUserCreate.login);
          });
      });
      it(`[PATCH] user/:id`, () => {
        mocUserCreate.surname = 'tt';
        mocUserCreate.rights = {};
        mocUserCreate.phone = '7199999999';
        mocUserCreate.name = 'tt';
        mocUserCreate.secondname = 'tt';
        return request(app.getHttpServer())
          .patch('/user/' + mocUserCreate.id)
          .set(authCookieHeader)
          .send(mocUserCreate)
          .expect(200)
          .then(({ body }) => {
            const result = checkBody(body);
            expect(result.phone).toBe(mocUserCreate.phone);
            expect(result.login).toBe(mocUserCreate.login);
          });
      });
      it(`[GET] user/:id/activate`, () => {
        return request(app.getHttpServer())
          .get('/user/' + mocUserCreate.id + '/activate')
          .set(authCookieHeader)
          .expect(404);
      });
    });

    describe('[user] ban/unban', () => {
      it(`[failed][POST] auth/login`, () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(mocUserAuthFailed)
          .expect(401)
          .then(() =>
            request(app.getHttpServer())
              .post('/auth/login')
              .send(mocUserAuthFailed)
              .expect(401),
          )
          .then(() =>
            request(app.getHttpServer())
              .post('/auth/login')
              .send(mocUserAuthFailed)
              .expect(401),
          )
          .then(() =>
            request(app.getHttpServer())
              .post('/auth/login')
              .send(mocUserAuthFailed)
              .expect(401),
          )
          .then(() =>
            request(app.getHttpServer())
              .post('/auth/login')
              .send(mocUserAuthFailed)
              .expect(401),
          )
          .then(() =>
            request(app.getHttpServer())
              .post('/auth/login')
              .send(mocUserAuthFailed)
              .expect(404),
          );
      });
      it(`[GET] user/:id/unban`, () => {
        return request(app.getHttpServer())
          .get('/user/' + mocUserCreate.id + '/unban')
          .set(authCookieHeader)
          .expect(200)
          .then(({ body }) => checkBody(body, false));
      });
      it(`[POST] auth/login`, () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({ ...mocUserAuthFailed, password: mocUserCreate.password })
          .expect(200);
      });
    });

    describe('[user] Delete', () => {
      it(`[DELETE] user/:id`, () => {
        return request(app.getHttpServer())
          .delete('/user/' + mocUserCreate.id)
          .set(authCookieHeader)
          .expect(200)
          .then(({ body }) => checkBody(body, false));
      });
      it(`[GET] user/:id`, () => {
        return request(app.getHttpServer())
          .get('/user/' + mocUserCreate.id)
          .set(authCookieHeader)
          .expect(200)
          .then(({ body }) => {
            const result = checkBody(body, false);
            expect(result.active).toBe(false);
          });
      });
      it(`[GET] user/:id/activate`, () => {
        return request(app.getHttpServer())
          .get('/user/' + mocUserCreate.id + '/activate')
          .set(authCookieHeader)
          .expect(200)
          .then(({ body }) => checkBody(body, false));
      });
    });
  });

  describe('{ssh,jobs,log}Controller', () => {
    describe('[ssh] Create/Update/Read', () => {
      it(`[POST] ssh`, () => {
        fs.writeFileSync('./tests/ppk', process.env.TEST_KEY);
        return request(app.getHttpServer())
          .post('/ssh')
          .set(authCookieHeader)
          .field('host', mocSshCreate.host)
          .field('port', mocSshCreate.port)
          .attach('privateKey', fs.createReadStream('./tests/ppk'))
          .field('username', mocSshCreate.username)
          .field('description', mocSshCreate.description)
          .expect(201)
          .then(({ body }) => {
            const result = checkBody(body);
            expect(result.username).toBe(mocSshCreate.username);
            mocSshCreate.id = result.id;
          })
          .finally(() =>
            fs.promises.rm('./tests/ppk').catch((err) => err.message),
          );
      });
      it(`[GET] ssh/:id`, () => {
        return request(app.getHttpServer())
          .get('/ssh/' + mocSshCreate.id)
          .set(authCookieHeader)
          .expect(200)
          .then(({ body }) => {
            const result = checkBody(body);
            expect(result.username).toBe(mocSshCreate.username);
          });
      });
      it(`[PATCH] ssh/:id`, () => {
        mocSshCreate.description = 'test1';
        return request(app.getHttpServer())
          .patch('/ssh/' + mocSshCreate.id)
          .set(authCookieHeader)
          .send({
            description: mocSshCreate.description,
          })
          .expect(200)
          .then(({ body }) => {
            const result = checkBody(body);
            expect(result.description).toBe(mocSshCreate.description);
          });
      });
      it(`[GET] ssh`, () => {
        return request(app.getHttpServer())
          .get('/ssh/')
          .set(authCookieHeader)
          .expect(200)
          .then(({ body }) => {
            const result = checkBody(body);
            const ind = result.findIndex(
              (e) => e.username === mocSshCreate.username,
            );
            expect(ind).not.toBe(-1);
          });
      });
    });
    describe('[jobs] Create/Update/Read', () => {
      it(`[POST] job`, () => {
        return request(app.getHttpServer())
          .post('/jobs')
          .set(authCookieHeader)
          .send(mocJobCreate)
          .expect(201)
          .then(({ body }) => {
            const result = checkBody(body);
            expect(result.job).toBe(mocJobCreate.job);
            mocJobCreate.id = result.id;
          });
      });
      it(`[PATCH] jobs/:id`, () => {
        mocJobCreate.job = 'ls ~/';
        return request(app.getHttpServer())
          .patch('/jobs/' + mocSshCreate.id)
          .set(authCookieHeader)
          .send({
            job: mocJobCreate.job,
          })
          .expect(200)
          .then(({ body }) => {
            const result = checkBody(body);
            expect(result.job).toBe(mocJobCreate.job);
          });
      });
      it(`[POST] jobs/list`, () => {
        return request(app.getHttpServer())
          .post('/jobs/list')
          .set(authCookieHeader)
          .expect(200)
          .then(({ body }) => {
            const result = checkBody(body);
            const ind = result.findIndex((e) => e.job === mocJobCreate.job);
            expect(ind).not.toBe(-1);
          });
      });
    });

    describe('[log]', () => {
      it(
        `[wait] 1m`,
        () => {
          return sleep(1000 * 60);
        },
        1000 * 61,
      );
      //toDo get LOG
    });

    describe('[job] Delete', () => {
      it(`[DELETE] job`, () => {
        return request(app.getHttpServer())
          .del('/jobs/' + mocJobCreate.id)
          .set(authCookieHeader)
          .send(mocJobCreate)
          .expect(200);
      });
      it(`[POST] jobs/list`, () => {
        return request(app.getHttpServer())
          .post('/jobs/list')
          .set(authCookieHeader)
          .expect(200)
          .then(({ body }) => {
            const result = checkBody(body);
            const ind = result.findIndex((e) => e.job === mocJobCreate.job);
            expect(ind).toBe(-1);
          });
      });
    });
  });

  afterAll(async () => {
    app && (await app.close());
    if (rootConnection) {
      await rootConnection.query(`drop database ${testDbName}`);
      await rootConnection.destroy();
    }
  });
});
