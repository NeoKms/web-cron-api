import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import FilterJobsDto from './dto/filter-jobs.dto';
import CreateJobDto from './dto/create-job.dto';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { SshService } from '../ssh/ssh.service';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { fillOptionsByParams } from '../helpers/constants';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sshService: SshService,
    private readonly dataSource: DataSource,
  ) {}

  async list(params: FilterJobsDto, user: ResponseUserDto): Promise<Job[]> {
    const options: FindManyOptions<Job> = { select: {} };
    options.where = {} as FindOptionsWhere<Job>;
    if (params?.select?.length) {
      options.select['id'] = true;
    }
    fillOptionsByParams(params, options);
    if (params?.filter?.sshId) {
      options.where.sshEntityId = params.filter.sshId;
    }
    return this.__filter(options, user);
  }

  async create(
    dto: CreateJobDto,
    user: ResponseUserDto,
    manager2?: EntityManager,
  ): Promise<Job> {
    let newJobSavedEntity = {} as Job;
    const newJob = dto.toEntity();
    await this.dataSource.transaction(async (manager) => {
      manager = manager2 ? manager2 : manager;
      newJobSavedEntity = await (manager
        ? manager.save(Job, newJob)
        : this.jobRepository.save(newJob));
      await this.updateJobsOnServer(
        newJobSavedEntity.sshEntityId,
        user,
        manager,
      );
    });
    return newJobSavedEntity;
  }

  private async updateJobsOnServer(
    sshId: number,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<void> {
    const jobs = await this.__filter(
      {
        select: { id: true, job: true, time: {} },
        where: { sshEntityId: sshId, isDel: 0, isActive: 1 },
      },
      user,
      manager,
    );
    return this.sshService.updateJobsOnServer(sshId, jobs, user, manager);
  }

  async updateStatus(
    id: number,
    status: 0 | 1,
    user: ResponseUserDto,
    manager2?: EntityManager,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      manager = manager2 ? manager2 : manager;
      const repo = manager ? manager.getRepository(Job) : this.jobRepository;
      await this.checkExist(id, user, true, manager);
      await repo.update(id, repo.create({ isActive: status }));
      const [job] = await this.__filter(
        {
          where: { id },
          select: { sshEntityId: true },
        },
        user,
        manager,
      );
      await this.updateJobsOnServer(job.sshEntityId, user, manager);
    });
  }

  async update(
    id: number,
    dto: Partial<CreateJobDto>,
    user: ResponseUserDto,
    manager2?: EntityManager,
  ): Promise<Job> {
    if (!Object.keys(dto).length) {
      throw new BadRequestException(this.i18n.t('job.errors.bad_req'));
    }
    let jobSaved = {} as Job;
    await this.dataSource.transaction(async (manager) => {
      manager = manager2 ? manager2 : manager;
      const repo = manager ? manager.getRepository(Job) : this.jobRepository;
      await this.checkExist(id, user, true, manager);
      await repo.update(id, repo.create(dto));
      [jobSaved] = await this.__filter({ where: { id } }, user, manager);
      await this.updateJobsOnServer(jobSaved.sshEntityId, user, manager);
    });
    return jobSaved;
  }

  private async __filter(
    options: FindManyOptions<Job>,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<Job[]> {
    if (!options.where) {
      options.where = {} as FindOptionsWhere<Job>;
    }
    options.where = Object.assign(options.where, {
      isDel: 0,
      sshEntity: {
        userEntityId: user.id,
      },
    } as FindOptionsWhere<Job>);
    const repo = manager ? manager.getRepository(Job) : this.jobRepository;
    return repo.find(options);
  }

  private async checkExist(
    id: number,
    user: ResponseUserDto,
    withError = true,
    manager?: EntityManager,
  ): Promise<boolean> {
    const [exist] = await this.__filter(
      {
        where: { id, isDel: 0 },
        select: { id: true },
      },
      user,
      manager,
    );
    if (!exist && withError) {
      throw new NotFoundException(this.i18n.t('job.errors.not_found'));
    }
    return !!exist;
  }

  async delete(
    id: number,
    user: ResponseUserDto,
    manager2?: EntityManager,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      manager = manager2 ? manager2 : manager;
      const repo = manager ? manager.getRepository(Job) : this.jobRepository;
      const [job] = await this.__filter(
        {
          where: { id },
          select: { sshEntityId: true },
        },
        user,
        manager,
      );
      if (!job) {
        throw new NotFoundException(this.i18n.t('job.errors.not_found'));
      }
      await repo.update({ id, isDel: 0 }, repo.create({ isDel: 1 }));
      await this.updateJobsOnServer(job.sshEntityId, user, manager);
    });
  }
}
