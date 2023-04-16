import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { AuthSerializer } from './passport/serialization.provider';
import { MailerService } from '../mailer/mailer.service';

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      session: true,
    }),
  ],
  providers: [AuthService, LocalStrategy, AuthSerializer, MailerService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
