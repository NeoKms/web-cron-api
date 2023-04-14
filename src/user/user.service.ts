import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { FindOneUser } from '../helpers/interfaces/user';
import { I18nService } from 'nestjs-i18n';
import { SimpleObject } from '../helpers/interfaces/common';
import { I18nTranslations } from '../i18n/i18n.generated';
import { getNowTimestampSec } from '../helpers/constants';
import { Organization } from '../organization/entities/organization.entity';
import { ResponseUserDto } from './dto/response-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    const isExistUserByPhone = await this.findOne(
      {
        phone: createUserDto.phone,
        onlyActive: null,
        withoutError: true,
      },
      manager,
    );
    const isExistUserByLogin = await this.findOne(
      {
        login: createUserDto.toEntity().login,
        onlyActive: null,
        withoutError: true,
      },
      manager,
    );
    if (isExistUserByPhone) {
      throw new BadRequestException(this.i18n.t('user.errors.duplicate_phone'));
    }
    if (isExistUserByLogin) {
      throw new BadRequestException(this.i18n.t('user.errors.duplicate_login'));
    }
    const userEntityToSave = createUserDto.toEntity();
    userEntityToSave.orgEntities = [
      new Organization({ id: user.orgSelectedId }),
    ];
    return manager
      ? manager.save(User, userEntityToSave)
      : this.userRepository.save(userEntityToSave);
  }

  async findAll(user: ResponseUserDto): Promise<User[]> {
    return this.userRepository.find({
      where: {
        orgEntities: {
          id: user.orgSelectedId,
        },
      },
    });
  }

  async findOne(
    { id, phone, onlyActive, withoutError, login, orgId }: FindOneUser,
    manager?: EntityManager,
  ): Promise<User> {
    let where: SimpleObject = {};
    const repoUser = manager
      ? manager.getRepository(User)
      : this.userRepository;
    if (onlyActive !== null) {
      where = {
        active: typeof onlyActive === 'undefined' ? true : onlyActive,
      };
    }
    if (where.active) {
      where.banned_to = LessThan(getNowTimestampSec());
    }
    if (id) {
      where.id = id;
    } else if (login) {
      where.login = login;
    } else if (phone) {
      where.phone = phone;
    } else {
      throw new BadRequestException(this.i18n.t('user.errors.bad_req'));
    }
    const qb = repoUser
      .createQueryBuilder('user')
      .leftJoin(
        'organization_user_list',
        'orgUserList',
        'orgUserList.userId=user.id',
      )
      .leftJoinAndMapMany(
        'user.orgEntities',
        Organization,
        'orgList',
        'orgList.id=orgUserList.organizationId',
      )
      .where(where);
    if (orgId) {
      qb.andWhere('orgUserList.organizationId = :orgId', { orgId });
    }
    const user = await qb.getOne();
    if (!user && withoutError !== true) {
      throw new NotFoundException(this.i18n.t('user.errors.not_found'));
    }
    if (user) {
      user.orgSelectedId = -1;
      if (user?.orgEntities?.length) {
        user.orgSelectedId = user.orgEntities[0].id;
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
    await this.findOne(
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
    return this.findOne({ id }, manager);
  }

  async remove(
    id: number,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<void> {
    await this.findOne({ id, orgId: user.orgSelectedId }, manager);
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    await repo.update(id, repo.create({ active: false, rights: {} }));
  }

  async activate(
    id: number,
    user: ResponseUserDto,
    manager?: EntityManager,
  ): Promise<void> {
    await this.findOne(
      { id, onlyActive: false, orgId: user.orgSelectedId },
      manager,
    );
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    await repo.update(id, repo.create({ active: true }));
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

  changeOrg(id: number, user: ResponseUserDto) {
    const org = user.orgEntities.find((org) => org.id === +id);
    if (org) {
      user.orgSelectedId = +id;
    } else {
      throw new BadRequestException(this.i18n.t('user.errors.org_change'));
    }
  }
}
