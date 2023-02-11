import { Module } from '@nestjs/common';
import { SshController } from './ssh.controller';
import { SshService } from './ssh.service';

@Module({
  imports: [],
  controllers: [SshController],
  providers: [SshService],
})
export class SshModule {}
