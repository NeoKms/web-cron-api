import { resolve } from 'path';
import * as dotenv from 'dotenv';
import * as fsSync from 'fs';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

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

export const ORMConfig: TypeOrmModuleOptions = {
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
};

export default () => ({
  PRODUCTION,
  SENTRY: env.SENTRY || false,
  PORT: parseInt(env.PORT) || 3001,
  DB: ORMConfig,
  UPLOAD,
  REDIS: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT),
  },
  SESSION: {
    secret: env.COOKIE_SECRET,
    key: 'connect.sid',
    cookie_domain: env.COOKIE_DOMAIN,
  },
});
