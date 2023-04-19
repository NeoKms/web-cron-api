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
import { RedisService } from 'nestjs-redis';
import * as Redis from 'ioredis';
import { md5 } from '../helpers/constants';

@Injectable()
export class OrganizationService {
  private readonly redisClient: Redis.Redis;
  private readonly INVITE_CODE_EXPIRES_SEC = 2 * 24 * 60 * 60;
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly redisService: RedisService,
  ) {
    this.redisClient = redisService.getClient();
  }

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
        onlyActive: null,
        withoutError: true,
      }),
    );
    if (
      (existUser &&
        !existUser.orgEntities.find((org) => org.id === user.orgSelectedId)) ||
      !existUser
    ) {
      const orgEntity = user.orgEntities.find(
        (org) => org.id === user.orgSelectedId,
      );
      const inviteCode = md5(email + Date.now());
      await this.redisClient.set(
        inviteCode,
        JSON.stringify({
          email: email,
          orgId: user.orgSelectedId,
        }),
        'EX',
        this.INVITE_CODE_EXPIRES_SEC,
      );
      this.mailerService
        .sendEmail(
          email,
          this.i18n.t('mailer.email_templates.add_in_org.subject', {
            args: {
              org_name: orgEntity.name,
            },
          }),
          this.i18n.t('mailer.email_templates.add_in_org.text', {
            args: {
              org_name: orgEntity.name,
              code: inviteCode,
              hours: this.INVITE_CODE_EXPIRES_SEC / (60 * 60),
            },
          }),
        )
        .catch(() => null);
    }
  }
}
