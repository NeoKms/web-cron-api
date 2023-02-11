import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, Repository } from 'typeorm';
import User from './entities/user.entity';
import { FindOneUser } from '../helpers/interfaces/findOneUser.interface';
import { I18nService } from 'nestjs-i18n';
import { SimpleObject } from '../helpers/interfaces/simplejObect.interface';
import { I18nTranslations } from '../i18n/i18n.generated';

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
      where.banned_to = LessThan(Math.round(Date.now() / 1000));
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
      .where(where)
      .getOne();
    if (!user && withoutError !== true) {
      throw new NotFoundException(this.i18n.t('user.errors.not_found'));
    }
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
    const user = await this.findOne({ id }, manager);
    user.active = false;
    user.rights = {};
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    await repo.save(user);
  }

  async activate(id: number, manager?: EntityManager): Promise<void> {
    const user = await this.findOne({ id, onlyActive: false }, manager);
    user.active = true;
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    await repo.save(user);
  }

  async unban(id: number, manager?: EntityManager): Promise<void> {
    const user = await this.findOne({ id, onlyActive: null }, manager);
    user.banned_to = 0;
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    await repo.save(user);
  }
}
