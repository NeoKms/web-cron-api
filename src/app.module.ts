import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { RedisModule } from 'nestjs-redis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as pathModule from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SshModule } from './ssh/ssh.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { JobsModule } from './jobs/jobs.module';
import { ScheduleModule } from '@nestjs/schedule';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [
    NestjsFormDataModule.config({ isGlobal: true }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('REDIS'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('DB'),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: pathModule.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
      typesOutputPath: pathModule.join(
        __dirname,
        '../src/i18n/i18n.generated.ts',
      ),
    }),
    UserModule,
    AuthModule,
    SshModule,
    JobsModule,
    OrganizationModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(Sentry.Handlers.requestHandler()).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
