import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './eitities/log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { FindManyOptionsAdd } from '../helpers/interfaces/common';
import FilterLogDto from './dto/filter.log.dto';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import PaginateDto from '../helpers/paginate.dto';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { LogFind } from '../helpers/interfaces/log';
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
    const result = { data: [], all: 0 };
    if (options?.skip >= 0) {
      await repo.findAndCount(options).then(([d, a]) => {
        result.data = d;
        result.all = a;
      });
    } else {
      result.data = await repo.find(options);
    }
    return result;
  }

  public async delete(
    logFindObj: LogFind,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(Log) : this.logRepository;
    await repo.update(
      {
        timestamp_start: logFindObj.timestamp_start,
        jobEntity: {
          id: logFindObj.jobId,
          sshEntity: {
            id: logFindObj.sshId,
            userEntity: {
              id: user.id,
            },
          },
        },
      },
      repo.create({ isDel: 1 }),
    );
  }

  public async getOne(
    logFindObj: LogFind,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<Log> {
    const params: FilterLogDto = {
      select: ['content'],
      filter: {
        jobId: logFindObj.jobId,
        sshId: logFindObj.sshId,
        timestamp_start: logFindObj.timestamp_start,
      },
      options: {
        itemsPerPage: 1,
        page: 0,
      },
    };
    const [log] = await this.list(params, user, manager).then(
      ({ data }) => data,
    );
    if (!log) {
      throw new NotFoundException();
    }
    return log;
  }
  public async list(
    params: FilterLogDto,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<{ data: Log[]; pagination: PaginateDto }> {
    const options: FindManyOptionsAdd<Log> = {
      select: {
        timestamp_start: true,
        timestamp_end: true,
        status: true,
        jobEntityId: true,
        jobEntity: {
          id: true,
          sshEntityId: true,
        },
      },
      relations: {
        jobEntity: {},
      },
      order: { timestamp_start: 'DESC' },
      take: 10,
      skip: 0,
    };
    options.where = {
      isDel: 0,
      jobEntity: {
        sshEntity: {
          userEntity: {
            id: user.id,
          },
        },
      },
    } as FindOptionsWhere<Log>;
    if (params.options?.itemsPerPage) {
      options.take = params.options.itemsPerPage;
      if (params.options?.hasOwnProperty('page')) {
        options.skip = params.options.itemsPerPage * (params.options.page - 1);
        options.skip < 0 && delete options.skip;
      }
    }
    if (params.select?.length) {
      params.select.forEach((pathProp) =>
        pathProp.split('.').reduce((acc, prop, ind, arr) => {
          if (ind === arr.length - 1) {
            acc[prop] = true;
          } else if (!acc.hasOwnProperty(prop)) {
            acc[prop] = {};
          }
          return acc[prop];
        }, options.select),
      );

      const checkRelationDeep = (relations, select) => {
        Object.keys(select).forEach((prop) => {
          if (/Entity$/gi.test(prop)) {
            if (!relations.hasOwnProperty(prop)) {
              relations[prop] = {};
            }
            if (typeof select[prop] === 'object') {
              checkRelationDeep(relations[prop], select[prop]);
            }
          }
        });
      };
      checkRelationDeep(options.relations, options.select);
    }
    console.log(JSON.stringify(options, null, 2), params.select);
    if (params?.options?.sortBy?.length) {
      options.order = params?.options?.sortBy.reduce((acc, prop, ind) => {
        acc[prop] = 'ASC';
        if (params.options?.sortDesc?.length >= ind + 1) {
          acc[prop] = 'DESC';
        }
        return acc;
      }, {});
    }
    if (Object.keys(params?.filter)?.length) {
      if (params.filter.hasOwnProperty('sshId')) {
        options.where.jobEntity['sshEntity'].id = params.filter.sshId;
      }
      if (params.filter.hasOwnProperty('jobId')) {
        options.where.jobEntity['id'] = params.filter.jobId;
      }
      if (params.filter.hasOwnProperty('timestamp_start')) {
        options.where.timestamp_start = params.filter.timestamp_start;
      }
    }
    const { data, all } = await this.__filter(options, manager);
    console.log(data[0]);
    return {
      data,
      pagination: {
        all,
        page: options.skip / options.take + 1,
        itemsPerPage: options.take,
      },
    };
  }
}
