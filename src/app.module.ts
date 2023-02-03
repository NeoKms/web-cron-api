import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config'
import {ConfigModule, ConfigService} from "@nestjs/config";
import * as Sentry from "@sentry/node";
import {RedisModule} from "nestjs-redis";
import {TypeOrmModule, TypeOrmModuleOptions} from "@nestjs/typeorm";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config]
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('REDIS'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => configService.get('DB')
    }),
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
