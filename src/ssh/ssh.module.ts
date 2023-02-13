import { Module } from '@nestjs/common';
import { SshController } from './ssh.controller';
import { SshService } from './ssh.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Ssh } from './entities/ssh.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ssh]), ConfigModule],
  controllers: [SshController],
  providers: [SshService],
})
export class SshModule {}
