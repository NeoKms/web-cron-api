import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import UpdateOrgDto from './dto/update-org.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
  ) {}

  getById(id: number): Promise<Organization> {
    return this.orgRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateOrgDto) {
    return this.orgRepository.update(id, this.orgRepository.create(dto));
  }
}
