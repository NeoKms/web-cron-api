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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
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
    if (isExistUserByPhone) {
      throw new BadRequestException(this.i18n.t('user.errors.duplicate_phone'));
    }
    const userEntityToSave = createUserDto.toEntity();
    return manager
      ? manager.save(User, userEntityToSave)
      : this.userRepository.save(userEntityToSave);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(
    { id, phone, onlyActive, withoutError, login }: FindOneUser,
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
    const user = await repoUser
      .createQueryBuilder('user')
      .leftJoin('organization_user_list', 'orgList', 'orgList.userId=user.id')
      .leftJoinAndMapMany(
        'user.orgEntities',
        Organization,
        'orgSelected',
        'orgSelected.id=orgList.organizationId',
      )
      .where(where)
      .getOne();
    if (!user && withoutError !== true) {
      throw new NotFoundException(this.i18n.t('user.errors.not_found'));
    }
    user.orgSelectedId = user.orgEntities[0].id;
    return user;
  }

  async updateInternal(id: number, user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    await this.findOne({ id, onlyActive: null }, manager);
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

  async remove(id: number, manager?: EntityManager): Promise<void> {
    await this.findOne({ id }, manager);
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    await repo.update(id, repo.create({ active: false, rights: {} }));
  }

  async activate(id: number, manager?: EntityManager): Promise<void> {
    await this.findOne({ id, onlyActive: false }, manager);
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    await repo.update(id, repo.create({ active: true }));
  }

  async unban(id: number, manager?: EntityManager): Promise<void> {
    await this.findOne({ id, onlyActive: null }, manager);
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    await repo.update(id, repo.create({ banned_to: 0 }));
  }
}
