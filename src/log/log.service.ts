import { Injectable } from '@nestjs/common';
import { EntityManager, FindOptionsSelectByString, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './eitities/log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { FindManyOptionsAdd } from '../helpers/interfaces/common';
import FilterLogDto from './dto/filter.log.dto';
import { Job } from '../jobs/entities/job.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
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

  private async __filter(
    options: FindManyOptionsAdd<Log>,
    manager?: EntityManager,
  ): Promise<Log[]> {
    const repo = manager ? manager.getRepository(Log) : this.logRepository;
    return repo.find(options);
  }

  public async list(params: FilterLogDto): Promise<Log[]> {
    const options: FindManyOptionsAdd<Log> = {
      order: { timestamp_start: 'DESC' },
      where: {} as FindOptionsWhere<Log>,
      take: 10,
      skip: 0,
    };
    if (params.options?.itemsPerPage) {
      options.take = params.options.itemsPerPage;
      if (params.options?.page) {
        options.skip = params.options.itemsPerPage * (params.options.page - 1);
      }
    }
    if (params.select?.length) {
      options.select = params.select as FindOptionsSelectByString<Log>;
    }
    if (Object.keys(params?.whereRaw ?? {})?.length) {
      options.where = params.whereRaw;
    }
    if (params?.options?.groupBy?.length) {
    }
    options.where['isDel'] = 0;
    const pagination = {
      all: 0,
      page: 1,
      perPage: 10,
    }; //toDo
    return this.__filter(options);
  }
}
