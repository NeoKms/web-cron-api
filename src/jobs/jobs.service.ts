import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, FindOptionsSelectByString, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import FilterJobsDto from './dto/filter-jobs.dto';
import CreateJobDto from './dto/create-job.dto';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { SshService } from '../ssh/ssh.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sshService: SshService,
  ) {}

  async list(params: FilterJobsDto): Promise<Job[]> {
    const options: FindManyOptions<Job> = { where: {} };
    if (params.options?.itemsPerPage) {
      options.take = params.options.itemsPerPage;
      if (params.options?.page) {
        options.skip = params.options.itemsPerPage * (params.options.page - 1);
      }
    }
    if (params.select?.length) {
      options.select = params.select as FindOptionsSelectByString<Job>;
    }
    if (Object.keys(params?.whereRaw ?? {})?.length) {
      options.where = params.whereRaw;
    }
    return this.__filter(options);
  }

  async create(dto: CreateJobDto, manager?: EntityManager): Promise<Job> {
    const newJob = dto.toEntity();
    const job = await (manager
      ? manager.save(Job, newJob)
      : this.jobRepository.save(newJob));
    await this.updateJobsOnServer(job.sshEntityId, manager);
    return job;
  }

  private async updateJobsOnServer(
    sshId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const jobs = await this.__filter(
      {
        select: { id: true, job: true, time: {} },
        where: { sshEntityId: sshId, isDel: 0, isActive: 1 },
      },
      manager,
    );
    return this.sshService.updateJobsOnServer(sshId, jobs, manager);
  }

  async updateStatus(
    id: number,
    status: 0 | 1,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(Job) : this.jobRepository;
    await this.checkExist(id, true, manager);
    await repo.update(id, repo.create({ isActive: status }));
    const [job] = await this.__filter(
      {
        where: { id },
        select: { sshEntityId: true },
      },
      manager,
    );
    await this.updateJobsOnServer(job.sshEntityId, manager);
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
    await this.checkExist(id, true, manager);
    await repo.update(id, repo.create(dto));
    const [job] = await this.__filter({ where: { id } });
    await this.updateJobsOnServer(job.sshEntityId, manager);
    return job;
  }

  private async __filter(
    options: FindManyOptions<Job>,
    manager?: EntityManager,
  ): Promise<Job[]> {
    if (!options.where) {
      options.where = {};
    }
    options.where['isDel'] = 0;
    const repo = manager ? manager.getRepository(Job) : this.jobRepository;
    return repo.find(options);
  }

  private async checkExist(
    id: number,
    withError = true,
    manager?: EntityManager,
  ): Promise<boolean> {
    const [exist] = await this.__filter(
      {
        where: { id, isDel: 0 },
        select: { id: true },
      },
      manager,
    );
    if (!exist && withError) {
      throw new NotFoundException(this.i18n.t('job.errors.not_found'));
    }
    return !!exist;
  }

  async delete(id: number, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Job) : this.jobRepository;
    const [job] = await this.__filter(
      {
        where: { id },
        select: { sshEntityId: true },
      },
      manager,
    );
    if (!job) {
      throw new NotFoundException(this.i18n.t('job.errors.not_found'));
    }
    await repo.update({ id, isDel: 0 }, repo.create({ isDel: 1 }));
    await this.updateJobsOnServer(job.sshEntityId, manager);
  }
}
