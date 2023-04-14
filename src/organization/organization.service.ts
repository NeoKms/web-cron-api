import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { Organization } from './entities/organization.entity';
import UpdateOrgDto from './dto/update-org.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  getById(id: number): Promise<Organization> {
    return this.orgRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateOrgDto) {
    return this.orgRepository.update(id, this.orgRepository.create(dto));
  }
}
