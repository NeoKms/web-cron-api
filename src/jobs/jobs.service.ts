import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import FilterJobsDto from './dto/filter-jobs.dto';
import CreateJobDto from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
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

  async create(dto: CreateJobDto, manager?: EntityManager) {
    const newJob = dto.toEntity();
    return manager
      ? manager.save(Job, newJob)
      : this.jobRepository.save(newJob);
  }

  private async __filter(
    options: FindManyOptions<Job>,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Job) : this.jobRepository;
    return repo.find(options);
  }
}
