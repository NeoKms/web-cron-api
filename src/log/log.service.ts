import { Injectable } from '@nestjs/common';
import { EntityManager, FindOptionsSelectByString, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './eitities/log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { FindManyOptionsAdd } from '../helpers/interfaces/common';
import FilterLogDto from './dto/filter.log.dto';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import PaginateDto from '../helpers/paginate.dto';
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
  ): Promise<{ data: Log[]; all: number }> {
    const repo = manager ? manager.getRepository(Log) : this.logRepository;
    const result = { data: [], all: -1 };
    console.log(options);
    if (options?.skip > 0) {
      await repo.findAndCount(options).then(([d, a]) => {
        result.data = d;
        result.all = a;
      });
    } else {
      result.data = await repo.find(options);
    }
    return result;
  }

  public async list(
    params: FilterLogDto,
  ): Promise<{ data: Log[]; pagination: PaginateDto }> {
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
      options.select = params.select.reduce((acc, el) => {
        acc[el] = true;
        return acc;
      }, {});
    }
    if (Object.keys(params?.whereRaw ?? {})?.length) {
      options.where = params.whereRaw;
    }
    if (params?.options?.groupBy?.length) {
    }
    options.where['isDel'] = 0;
    const result = await this.__filter(options);
    return {
      data: result.data,
      pagination: {
        all: result.all,
        page: options.skip / options.take + 1,
        itemsPerPage: options.take,
      },
    };
  }
}
