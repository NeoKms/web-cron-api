import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import FilterJobsDto from './dto/filter-jobs.dto';
import { Ssh } from '../ssh/entities/ssh.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async list(params: FilterJobsDto): Promise<Job[]> {
    const options: FindManyOptions<Job> = {};
    if (params.options.itemsPerPage) {
      options.take = params.options.itemsPerPage;
      if (params.options.page) {
        options.skip = params.options.itemsPerPage * (params.options.page - 1);
      }
    }
    if (params.select.length) {
      options.select = params.select.reduce((acc, el) => {
        acc[el] = true;
        return acc;
      }, {});
    }
    if (Object.entries(params.whereRaw).length) {
      options.where;
    }
    return this.__filter(options);
  }

  private async __filter(
    options: FindManyOptions<Job>,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Job) : this.jobRepository;
    return repo.find(options);
  }
}
