import { resolve } from 'path';
import * as dotenv from 'dotenv';
import * as fsSync from 'fs';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { existsSync, mkdirSync } from 'fs';

const { env } = process;
const PRODUCTION: boolean =
  String(env.PRODUCTION || false).toLowerCase() == 'true';
if (!PRODUCTION) {
  dotenv.config({ path: resolve(__dirname + '/../../.env') });
}

const checkStaticDirSync = (dir: string): string => {
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true, mode: '0755' });
  }
  return dir;
};

export const UPLOAD = checkStaticDirSync(
  env.UPLOAD || resolve(__dirname + '/../../upload') + '/',
);

export default () => ({
  PRODUCTION,
  IS_TEST: env.NODE_ENV === 'test',
  SENTRY: env.SENTRY || false,
  PORT: parseInt(env.PORT) || 3001,
  DB: {
    type: 'mariadb',
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT) || 3306,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: false,
    migrationsRun: true,
    migrations: ['dist/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    logging: ['query', 'error'],
    logger: 'file',
  } as TypeOrmModuleOptions,
  UPLOAD,
  GMAIL: {
    LOGIN: env.GMAIL_EMAIL,
    KEY: env.GMAIL_KEY,
  },
  SSH: {
    SECRET_KEY: env.SECRET_KEY || '123',
    SALT: env.COOKIE_SECRET || '123',
  },
  U_DIRS: {
    keys: checkStaticDir(UPLOAD + 'keys/'),
  },
  REDIS: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT),
  },
  SESSION: {
    secret: env.COOKIE_SECRET,
    key: 'connect.sid',
    cookie_domain: env.COOKIE_DOMAIN,
  },
  SELF_DOMAIN: env.SELF_DOMAIN ?? '',
});

function checkStaticDir(dir: string): string {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o776 });
  }
  return dir;
}
