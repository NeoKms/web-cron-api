import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './eitities/log.entity';
import { CreateLogDto } from './dto/create-log.dto';
@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async create(dto: CreateLogDto, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Log) : this.logRepository;
    return repo.save(dto.toEntity());
  }
}
