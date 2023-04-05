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
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import SshClientFactory from './client/SshClientFactory';
import { Job } from '../jobs/entities/job.entity';
import { LogService } from '../log/log.service';
import { CronExpression, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { getNowTimestampSec } from '../helpers/constants';
import { Logger } from '../helpers/logger';
@Injectable()
export class SshService {
  private readonly logger = new Logger(SshService.name);
  private serversInProgress = new Set();
  private readonly cronJobNameTemplate = 'cronjob_logs_for_server___ID__';

  constructor(
    @InjectRepository(Ssh)
    private readonly sshRepository: Repository<Ssh>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly logService: LogService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}
  async getMany(manager?: EntityManager): Promise<Ssh[]> {
    return this.__filter({}, manager);
  }

  private deleteCronJobForServer(id) {
    this.schedulerRegistry.deleteCronJob(
      this.cronJobNameTemplate.replace('__ID__', id),
    );
    this.logger.log(
      this.i18n.t('ssh.messages.delete_server_id', { args: { id } }),
    );
  }
  private setCronJobForServer(id) {
    const job = new CronJob(
      CronExpression.EVERY_MINUTE,
      this.serverLogCronJobWrapper(id),
    );
    this.schedulerRegistry.addCronJob(
      this.cronJobNameTemplate.replace('__ID__', id),
      job,
    );
    job.start();
    this.logger.log(
      this.i18n.t('ssh.messages.add_server_id', { args: { id } }),
    );
  }
  @Timeout(1000)
  private async setAllServersInSchedule() {
    this.logger.log(this.i18n.t('ssh.messages.start_all_servers'));
    const serverIds = await this.__filter({
      select: ['id'],
    }).then((res) => res.map((el) => el.id));
    this.logger.log(
      this.i18n.t('ssh.messages.need_add_count', {
        args: { cnt: serverIds.length },
      }),
    );
    for (let i = 0, c = serverIds.length; i < c; i++) {
      const id = serverIds[i];
      this.setCronJobForServer(id);
    }
  }

  private serverLogCronJobWrapper(id) {
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
    const sshEntity = await this.getById(id);
    const client = await SshClientFactory.getSSHInstance({
      host: sshEntity.host,
      username: sshEntity.username,
      port: sshEntity.port,
      privateKeyPath: this.configService.get('U_DIRS.keys') + sshEntity.id,
    });
    await client.upsertLogs(this.logService);
  }
  async getById(id: number, manager?: EntityManager): Promise<Ssh> {
    const [result] = await this.__filter({ where: { id } }, manager);
    if (!result) {
      throw new NotFoundException(this.i18n.t('ssh.errors.not_found'));
    }
    return result;
  }
  private async __filter(
    options: FindManyOptions<Ssh>,
    manager?: EntityManager,
  ): Promise<Ssh[]> {
    if (!Object.prototype.hasOwnProperty.call(options, 'where')) {
      options.where = {};
    }
    options.where['deleted_at'] = IsNull();
    const repo = manager ? manager.getRepository(Ssh) : this.sshRepository;
    return repo.find(options);
  }

  async updateJobsOnServer(
    id: number,
    jobs: Job[],
    manager?: EntityManager,
  ): Promise<void> {
    const sshEntity = await this.getById(id, manager);
    const client = await SshClientFactory.getSSHInstance({
      host: sshEntity.host,
      username: sshEntity.username,
      port: sshEntity.port,
      privateKeyPath: this.configService.get('U_DIRS.keys') + sshEntity.id,
    });
    await client.setJobs(jobs);
  }

  public async create(
    createSshDto: CreateSshDto,
    user: ResponseUserDto,
  ): Promise<Ssh> {
    let newSshEntity = {} as Ssh;
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Ssh);
      const [isExist] = await this.__filter(
        {
          select: ['id'],
          where: { username: createSshDto.username, host: createSshDto.host },
        },
        manager,
      );
      if (isExist) {
        throw new BadRequestException(this.i18n.t('ssh.errors.duplicate'));
      }
      newSshEntity = await repo.save(createSshDto.toEntity(user));
      await fsModule.writeFile(
        this.configService.get('U_DIRS.keys') + newSshEntity.id,
        createSshDto.privateKey.buffer.toString('utf-8'),
      );
    });
    return newSshEntity;
  }

  async update(
    id: number,
    updateSshDto: UpdateSshDto,
    manager?: EntityManager,
  ): Promise<Ssh> {
    const repo = manager ? manager.getRepository(Ssh) : this.sshRepository;
    await repo.update(id, updateSshDto.toEntity());
    const [result] = await this.__filter({}, manager);
    return result;
  }

  async delete(id: number, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Ssh) : this.sshRepository;
    const res = await repo
      .createQueryBuilder('ssh')
      .leftJoin('job', 'job', 'job.sshEntityId=ssh.id and job.isDel = 0')
      .select(['ssh.id', 'COUNT(job.id) as jobs'])
      .where('ssh.id = :id', { id })
      .groupBy('ssh.id')
      .having('jobs>0')
      .getRawOne();
    if (res) {
      throw new BadRequestException(this.i18n.t('ssh.errors.cannot_delete'));
    }
    await repo.update(id, repo.create({ deleted_at: getNowTimestampSec() }));
    this.deleteCronJobForServer(id);
  }
}
