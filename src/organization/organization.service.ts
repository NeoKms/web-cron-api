import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import UpdateOrgDto from './dto/update-org.dto';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { UserService } from '../user/user.service';
import { MailerService } from '../mailer/mailer.service';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  getById(id: number): Promise<Organization> {
    return this.orgRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateOrgDto) {
    return this.orgRepository
      .update(id, this.orgRepository.create(dto))
      .then(() => this.orgRepository.findOne({ where: { id } }));
  }

  async inviteUserByEmail(email: string, user: ResponseUserDto) {
    const existUser: ResponseUserDto = plainToInstance(
      ResponseUserDto,
      await this.userService.findOne({
        email,
        withoutError: true,
      }),
    );
    if (
      existUser &&
      !existUser.orgEntities.find((org) => org.id === user.orgSelectedId)
    ) {
      const orgEntity = user.orgEntities.find(
        (org) => org.id === user.orgSelectedId,
      );
      await this.orgRepository
        .createQueryBuilder()
        .relation(Organization, 'userEntities')
        .of({ id: user.orgSelectedId })
        .add(existUser);
      this.mailerService
        .sendEmail(
          email,
          this.i18n.t('mailer.email_templates.add_in_org.subject'),
          this.i18n.t('mailer.email_templates.add_in_org.text', {
            args: {
              org_name: orgEntity.name,
            },
          }),
        )
        .catch(() => null);
    }
  }
}
