import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
