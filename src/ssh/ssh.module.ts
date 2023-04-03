import { Module } from '@nestjs/common';
import { SshController } from './ssh.controller';
import { SshService } from './ssh.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Ssh } from './entities/ssh.entity';
import { LogModule } from '../log/log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ssh]), ConfigModule, LogModule],
  controllers: [SshController],
  providers: [SshService],
  exports: [SshService],
})
export class SshModule {}
