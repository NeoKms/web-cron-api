import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Ssh } from './entities/ssh.entity';
import CreateSshDto from './dto/create-ssh.dto';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { ConfigService } from '@nestjs/config';
import * as fsModule from 'fs/promises';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import UpdateSshDto from './dto/update-ssh.dto';
import SshClientFactory from './client/SshClientFactory';
import { Job } from '../jobs/entities/job.entity';
import { LogService } from '../log/log.service';
import { CronExpression, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { copyObj, getNowTimestampSec } from '../helpers/constants';
import { Logger } from '../helpers/logger';
import {
  additionalSelect,
  FindManyOptionsAdd,
} from '../helpers/interfaces/common';
import ResponseSshDto from './dto/response-ssh.dto';
import { FindOptionsSelect } from 'typeorm/find-options/FindOptionsSelect';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { SshClient } from './client/SshClient';
@Injectable()
export class SshService {
  private readonly logger = new Logger(SshService.name);
  private serversInProgress = new Set();
  private readonly cronJobNameTemplate = 'cronjob_logs_for_server___ID__';
  private readonly defaultAddSelect: additionalSelect<Ssh, ResponseSshDto> = [
    'cntJobs',
    'cntJobsActive',
    'privateKeyPath',
  ];

  constructor(
    @InjectRepository(Ssh)
    private readonly sshRepository: Repository<Ssh>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly logService: LogService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}
  async getMany(
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<ResponseSshDto[]> {
    return this.__filter(
      { additionalSelect: copyObj(this.defaultAddSelect) },
      user,
      manager,
    );
  }

  private async getSshClient(sshEntity: ResponseSshDto): Promise<SshClient> {
    return SshClientFactory.getSSHInstance({
      id: sshEntity.id,
      host: sshEntity.host,
      username: sshEntity.username,
      port: sshEntity.port,
      privateKeyPath: sshEntity.privateKeyPath,
    });
  }
  private removeServerFromLogCollectorSchedule(id: number) {
    const jobs = this.schedulerRegistry.getCronJobs();
    const jobName = this.cronJobNameTemplate.replace('__ID__', id.toString());
    if (jobs.has(jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
    }
    this.logger.log(
      this.i18n.t('ssh.messages.delete_server_id', { args: { id } }),
    );
  }
  private scheduleLogCollectorForServer(id) {
    const jobs = this.schedulerRegistry.getCronJobs();
    const jobName = this.cronJobNameTemplate.replace('__ID__', id);
    if (jobs.has(jobName)) return;
    const job = new CronJob(
      CronExpression.EVERY_MINUTE,
      this.logCollectorWrapper(id),
    );
    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    this.logger.log(
      this.i18n.t('ssh.messages.add_server_id', { args: { id } }),
    );
  }
  @Timeout(1000)
  private async setAllServersInSchedule() {
    try {
      this.logger.log(this.i18n.t('ssh.messages.start_all_servers'));
      const serversIds = await this.__filter(
        {
          select: { id: true },
          additionalSelect: ['cntJobs', 'privateKeyPath'],
        },
        null,
      )
        .then((res) => res.filter((s) => s.cntJobsActive > 0))
        .then((res) => res.map((s) => s.id));
      this.logger.log(
        this.i18n.t('ssh.messages.need_add_count', {
          args: { cnt: serversIds.length },
        }),
      );
      serversIds.forEach((id) => this.scheduleLogCollectorForServer(id));
    } catch (err) {
      this.logger.error(err);
    }
  }

  private logCollectorWrapper(id) {
    return async () => {
      if (this.serversInProgress.has(id)) return;
      this.logger.debug(
        this.i18n.t('ssh.messages.cron_job_start', { args: { id } }),
      );
      this.serversInProgress.add(id);
      await this.upsertLogs(id).catch((err) => this.logger.error(err));
      this.logger.debug(
        this.i18n.t('ssh.messages.cron_job_end', { args: { id } }),
      );
      this.serversInProgress.delete(id);
    };
  }
  private async upsertLogs(id: number) {
    const sshEntity = await this.getById(id, null);
    const client = await this.getSshClient(sshEntity);
    await client.upsertLogs(this.logService);
  }
  async getById(
    id: number,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<ResponseSshDto> {
    const [result] = await this.__filter(
      { where: { id }, additionalSelect: copyObj(this.defaultAddSelect) },
      user,
      manager,
    );
    if (!result) {
      throw new NotFoundException(this.i18n.t('ssh.errors.not_found'));
    }
    return result;
  }
  private async __filter(
    options: FindManyOptionsAdd<Ssh, ResponseSshDto>,
    user: ResponseUserDto | null,
    manager?: EntityManager,
  ): Promise<ResponseSshDto[]> {
    if (!options.where) {
      options.where = {} as FindOptionsWhere<Ssh>;
    }
    if (!options.select) {
      options.select = {} as FindOptionsSelect<Ssh>;
    }
    if (!options.additionalSelect && options?.additionalSelect !== false) {
      options.additionalSelect = [];
    }
    let jobsCntBySshId = null;
    if (
      options?.additionalSelect !== false &&
      !Array.isArray(options.select) &&
      Object.keys(options.select).length
    ) {
      if (
        options.additionalSelect.includes('privateKeyPath') &&
        !options.select.id
      ) {
        options.select.id = true;
      }
      if (options.additionalSelect.includes('cntJobs') && !options.select.id) {
        options.select.id = true;
      }
    }
    options.where = Object.assign(options.where, {
      deleted_at: IsNull(),
    } as FindOptionsWhere<Ssh>);
    if (user !== null) {
      options.where = Object.assign(options.where, {
        orgEntity: { id: user.orgSelectedId },
      } as FindOptionsWhere<Ssh>);
    }
    const repo = manager ? manager.getRepository(Ssh) : this.sshRepository;
    const elements: ResponseSshDto[] = await repo.find(options);
    if (options.additionalSelect !== false) {
      for (let i = 0, c = elements.length; i < c; i++) {
        const element = elements[i];
        const isAll = !options?.additionalSelect?.length;
        if (
          isAll ||
          options.additionalSelect.includes('cntJobs') ||
          options.additionalSelect.includes('cntJobsActive')
        ) {
          if (jobsCntBySshId === null) {
            jobsCntBySshId = await repo
              .createQueryBuilder('ssh')
              .leftJoin(
                'job',
                'jobAll',
                'jobAll.sshEntityId=ssh.id and jobAll.isDel = 0',
              )
              .leftJoin(
                'job',
                'jobActive',
                'jobActive.sshEntityId=ssh.id and jobActive.isDel = 0 and jobActive.isActive = 1',
              )
              .select([
                'ssh.id as id',
                'COUNT(jobAll.id) as jobs',
                'COUNT(jobActive.id) as jobsActive',
              ])
              .groupBy('ssh.id')
              .getRawMany()
              .then((res) =>
                res.reduce((acc, el) => {
                  acc[el.id] = {
                    cntJobs: +el.jobs,
                    cntJobsActive: +el.jobsActive,
                  };
                  return acc;
                }, {}),
              );
          }
          element.cntJobs = jobsCntBySshId[element.id]
            ? jobsCntBySshId[element.id].cntJobs
            : 0;
          element.cntJobsActive = jobsCntBySshId[element.id]
            ? jobsCntBySshId[element.id].cntJobsActive
            : 0;
        }
        if (isAll || options.additionalSelect.includes('privateKeyPath')) {
          element.privateKeyPath =
            this.configService.get('U_DIRS.keys') + element.id;
        }
      }
    }
    return elements;
  }

  async updateJobsOnServer(
    id: number,
    jobs: Job[],
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<void> {
    const sshEntity = await this.getById(id, user, manager);
    const client = await this.getSshClient(sshEntity);
    await client.setJobs(jobs);
    if (sshEntity.cntJobsActive > 0) {
      this.scheduleLogCollectorForServer(sshEntity.id);
    } else if (sshEntity.cntJobsActive === 0) {
      this.removeServerFromLogCollectorSchedule(sshEntity.id);
    }
  }

  public async create(
    createSshDto: CreateSshDto,
    user: ResponseUserDto,
  ): Promise<ResponseSshDto> {
    let newSshEntity = {} as ResponseSshDto;
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Ssh);
      const [isExist] = await this.__filter(
        {
          select: { id: true },
          where: { username: createSshDto.username, host: createSshDto.host },
        },
        user,
        manager,
      );
      if (isExist) {
        throw new BadRequestException(this.i18n.t('ssh.errors.duplicate'));
      }
      const { id } = await repo.save(createSshDto.toEntity(user));
      await fsModule.writeFile(
        this.configService.get('U_DIRS.keys') + id,
        createSshDto.privateKey.buffer.toString('utf-8'),
      );
      newSshEntity = await this.getById(id, user, manager);
      await this.getSshClient(newSshEntity);
    });
    return newSshEntity;
  }

  async update(
    id: number,
    updateSshDto: UpdateSshDto,
    user: ResponseUserDto,
    manager2?: EntityManager,
  ): Promise<ResponseSshDto> {
    let newSshEntity: ResponseSshDto = null;
    await this.dataSource.transaction(async (manager) => {
      manager = manager2 ? manager2 : manager;
      const repo = manager ? manager.getRepository(Ssh) : this.sshRepository;
      await repo.update(id, updateSshDto.toEntity());
      newSshEntity = await this.getById(id, user, manager);
      await this.getSshClient(newSshEntity);
    });
    return newSshEntity;
  }

  async delete(
    id: number,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(Ssh) : this.sshRepository;
    const res = await this.getById(id, user, manager);
    if (res.cntJobs > 0) {
      throw new BadRequestException(this.i18n.t('ssh.errors.cannot_delete'));
    }
    await repo.update(
      id,
      repo.create({
        deleted_at: getNowTimestampSec(),
        updated_at: getNowTimestampSec(),
      }),
    );
    this.removeServerFromLogCollectorSchedule(id);
  }
}
