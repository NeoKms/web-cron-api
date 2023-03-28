import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import FilterJobsDto from './dto/filter-jobs.dto';
import CreateJobDto from './dto/create-job.dto';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async list(params: FilterJobsDto): Promise<Job[]> {
    const options: FindManyOptions<Job> = {};
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
    if (Object.entries(params?.whereRaw ?? {}).length) {
      options.where;
    }
    return this.__filter(options);
  }

  async create(dto: CreateJobDto, manager?: EntityManager): Promise<Job> {
    const newJob = dto.toEntity();
    return manager
      ? manager.save(Job, newJob)
      : this.jobRepository.save(newJob);
  }

  async update(
    id: number,
    dto: Partial<CreateJobDto>,
    manager?: EntityManager,
  ) {
    if (!Object.keys(dto).length) {
      throw new BadRequestException(this.i18n.t('job.errors.bad_req'));
    }
    const repo = manager ? manager.getRepository(Job) : this.jobRepository;
    const [exist] = await this.__filter(
      {
        where: { id: id },
        select: { id: true },
      },
      manager,
    );
    if (!exist) {
      throw new NotFoundException(this.i18n.t('job.errors.not_found'));
    }
    await repo.update(id, repo.create(dto));
    return this.__filter({ where: { id: id } }).then(([res]) => res);
  }

  private async __filter(
    options: FindManyOptions<Job>,
    manager?: EntityManager,
  ): Promise<Job[]> {
    const repo = manager ? manager.getRepository(Job) : this.jobRepository;
    return repo.find(options);
  }
}
