import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { AuthSerializer } from './passport/serialization.provider';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      session: true,
    }),
    MailerModule,
  ],
  providers: [AuthService, LocalStrategy, AuthSerializer],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
