import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, LessThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { FindOneUser } from '../helpers/interfaces/user';
import { I18nService } from 'nestjs-i18n';
import { SimpleObject } from '../helpers/interfaces/common';
import { I18nTranslations } from '../i18n/i18n.generated';
import { defaultRights, getNowTimestampSec } from '../helpers/constants';
import { Organization } from '../organization/entities/organization.entity';
import { ResponseUserDto } from './dto/response-user.dto';
import { UsersInOrganizationEntity } from '../organization/entities/usersInOrganization.entity';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UsersInOrganizationEntity)
    private readonly usersInOrgRepository: Repository<UsersInOrganizationEntity>,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly dataSource: DataSource,
    private readonly mailerService: MailerService,
  ) {}

  async create(
    userDto: CreateUserDto | SignUpDto,
    user: ResponseUserDto | null,
    manager2?: EntityManager,
  ): Promise<User> {
    let newUserEntity: User | null = null;
    const isSignUp = userDto instanceof SignUpDto;
    if (!isSignUp && user === null) {
      throw new BadRequestException(this.i18n.t('user.errors.need_a_user'));
    }
    await this.dataSource.transaction(async (manager) => {
      manager = manager2 ? manager2 : manager;
      const userInOrgRepo = manager.getRepository(UsersInOrganizationEntity);
      const orgRepo = manager.getRepository(Organization);
      const userRepo = manager.getRepository(User);
      if (userDto.phone) {
        const isExistUserByPhone = await this.findOne(
          {
            phone: userDto.phone,
            onlyActive: null,
            withoutError: true,
          },
          manager,
        );
        if (isExistUserByPhone) {
          throw new BadRequestException(
            this.i18n.t('user.errors.duplicate_phone'),
          );
        }
      }
      if (userDto.email) {
        const isExistUserByEmail = await this.findOne(
          {
            email: userDto.email,
            onlyActive: null,
            withoutError: true,
          },
          manager,
        );
        if (isExistUserByEmail) {
          throw new BadRequestException(
            this.i18n.t('user.errors.duplicate_email'),
          );
        }
      }
      newUserEntity = await userRepo.save(userDto.toEntity());
      if (user && !isSignUp) {
        await userInOrgRepo.save(
          userInOrgRepo.create({
            organizationEntityId: user.orgSelectedId,
            userEntityId: newUserEntity.id,
            rights: defaultRights,
            isActive: true,
          }),
        );
      } else if (isSignUp) {
        const newOrgEntity = await orgRepo.save(
          orgRepo.create({
            name: `org_${Date.now()}`,
            created_at: getNowTimestampSec(),
            ownerUserEntity: newUserEntity,
          }),
        );
        await userInOrgRepo.save(
          userInOrgRepo.create({
            organizationEntityId: newOrgEntity.id,
            userEntityId: newUserEntity.id,
            rights: Object.keys(defaultRights).reduce((acc, key) => {
              acc[key] = 2;
              return acc;
            }, {}),
            isActive: true,
          }),
        );
      }
    });
    if (!isSignUp && newUserEntity) {
      const selectedOrg = user.orgEntities.find(
        (org) => org.id === user.orgSelectedId,
      );
      const userRepo = manager2
        ? manager2.getRepository(User)
        : this.userRepository;
      const orgAdminUser = await userRepo.findOne({
        select: { email: true },
        where: { id: selectedOrg.ownerUserEntityId },
      });
      this.mailerService.sendEmail(
        orgAdminUser.email,
        this.i18n.t('mailer.email_templates.about_new_user.subject', {
          args: {
            org_name: selectedOrg.name,
          },
        }),
        this.i18n.t('mailer.email_templates.about_new_user.text', {
          args: {
            name: newUserEntity.fio,
            email: newUserEntity.email,
          },
        }),
      );
    }
    return newUserEntity;
  }

  async findAll(user: ResponseUserDto): Promise<User[]> {
    const users = await this.userRepository.find({
      relations: ['userInOrganizationEntities'],
      where: {
        userInOrganizationEntities: {
          organizationEntityId: user.orgSelectedId,
        },
      },
    });
    users.forEach((user) => {
      user.isActive = user.userInOrganizationEntities[0].isActive;
    });
    return users;
  }

  async findOne(
    { id, phone, onlyActive, withoutError, email, orgId }: FindOneUser,
    manager?: EntityManager,
  ): Promise<User> {
    const where: SimpleObject = {};
    const repoUser = manager
      ? manager.getRepository(User)
      : this.userRepository;
    if (id) {
      where.id = id;
    } else if (email) {
      where.email = email;
    } else if (phone) {
      where.phone = phone;
    } else {
      throw new BadRequestException(this.i18n.t('user.errors.bad_req'));
    }
    const qb = repoUser
      .createQueryBuilder('user')
      .where(where)
      .innerJoinAndSelect(
        'user.userInOrganizationEntities',
        'orgNow',
        `${orgId ? 'orgNow.organizationEntityId= :orgId' : ''}`,
        { orgId: orgId },
      );
    if (onlyActive !== null) {
      qb.andWhere('orgNow.isActive = :active', {
        active: typeof onlyActive === 'undefined' ? true : onlyActive,
      });
      if (!orgId) {
        qb.andWhere({
          banned_to: LessThan(getNowTimestampSec()),
        });
      }
    }
    if (!orgId) {
      qb.leftJoin(
        'users_in_organization_entity',
        'orgUserList',
        'orgUserList.userEntityId=user.id and orgUserList.isActive=1',
      ).leftJoinAndMapMany(
        'user.orgEntities',
        Organization,
        'orgList',
        'orgList.id=orgUserList.organizationEntityId',
      );
    }
    const user = await qb.getOne();
    if (!user && withoutError !== true) {
      throw new NotFoundException(this.i18n.t('user.errors.not_found'));
    }
    if (user) {
      user.rights = user.userInOrganizationEntities[0].rights;
      user.isActive = user.userInOrganizationEntities[0].isActive;
      if (!orgId) {
        if (user?.orgEntities?.length) {
          user.orgSelectedId = user.orgEntities[0].id;
        }
      }
    }
    return user;
  }

  async updateInternal(id: number, user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    const repoUserInOrg = manager
      ? manager.getRepository(UsersInOrganizationEntity)
      : this.usersInOrgRepository;
    const existUser = await this.findOne(
      { id, onlyActive: null, orgId: user.orgSelectedId },
      manager,
    );
    const userEntityToUpd: User = updateUserDto.toEntity(id);
    if (userEntityToUpd.phone) {
      const isExistUserByPhone = await this.findOne(
        {
          phone: userEntityToUpd.phone,
          onlyActive: null,
          withoutError: true,
        },
        manager,
      );
      if (isExistUserByPhone && isExistUserByPhone.id !== id) {
        throw new BadRequestException(
          this.i18n.t('user.errors.duplicate_phone'),
        );
      }
    }
    await repo.save(userEntityToUpd);
    const [nowUserInOrgEntity] = existUser.userInOrganizationEntities;
    if (
      JSON.stringify(nowUserInOrgEntity.rights) !==
      JSON.stringify(updateUserDto.rights)
    ) {
      await repoUserInOrg.update(
        {
          userEntityId: id,
          organizationEntityId: user.orgSelectedId,
        },
        {
          rights: updateUserDto.rights,
        },
      );
    }
    return this.findOne(
      { id, onlyActive: null, orgId: user.orgSelectedId },
      manager,
    );
  }

  async deactivate(
    id: number,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<void> {
    const userInfo = await this.findOne(
      { id, onlyActive: true, orgId: user.orgSelectedId },
      manager,
    );
    const [orgInfo] = userInfo.userInOrganizationEntities;
    const repo = manager
      ? manager.getRepository(UsersInOrganizationEntity)
      : this.usersInOrgRepository;
    await repo.update(
      {
        userEntityId: orgInfo.userEntityId,
        organizationEntityId: orgInfo.organizationEntityId,
      },
      repo.create({ isActive: false, rights: defaultRights }),
    );
  }

  async activate(
    id: number,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<void> {
    const userInfo = await this.findOne(
      { id, onlyActive: false, orgId: user.orgSelectedId },
      manager,
    );
    const [orgInfo] = userInfo.userInOrganizationEntities;
    const repo = manager
      ? manager.getRepository(UsersInOrganizationEntity)
      : this.usersInOrgRepository;
    await repo.update(
      {
        userEntityId: orgInfo.userEntityId,
        organizationEntityId: orgInfo.organizationEntityId,
      },
      repo.create({ isActive: true }),
    );
  }

  async unban(
    id: number,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<void> {
    await this.findOne(
      { id, onlyActive: null, orgId: user.orgSelectedId },
      manager,
    );
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    await repo.update(id, repo.create({ banned_to: 0 }));
  }

  async changeOrg(id: number, user: ResponseUserDto): Promise<void> {
    const org = user.orgEntities.find((org) => org.id === +id);
    if (org) {
      user.orgSelectedId = +id;
      user.rights = await this.usersInOrgRepository
        .findOneBy({
          organizationEntityId: user.orgSelectedId,
          userEntityId: user.id,
        })
        .then(({ rights }) => rights);
    } else {
      throw new BadRequestException(this.i18n.t('user.errors.org_change'));
    }
  }

  async acceptInviteCode(user: ResponseUserDto, orgId: number): Promise<void> {
    await this.usersInOrgRepository.save(
      this.usersInOrgRepository.create({
        userEntityId: user.id,
        organizationEntityId: orgId,
        rights: defaultRights,
        isActive: true,
      }),
    );
  }
}
