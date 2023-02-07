import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { AuthSerializer } from './passport/serialization.provider';

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      session: true,
    }),
    ConfigModule,
  ],
  providers: [AuthService, LocalStrategy, AuthSerializer],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
