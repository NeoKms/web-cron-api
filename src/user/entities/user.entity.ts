import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import RightsDto from '../../auth/dto/rights.dto';
import { Organization } from '../../organization/entities/organization.entity';
import { UsersInOrganizationEntity } from '../../organization/entities/usersInOrganization.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  fio: string;

  @Column()
  password_hash: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phone: string;

  @Column({ type: 'int', nullable: true })
  login_timestamp: number;

  @Column({ type: 'int', default: 0 })
  login_cnt: number;

  @Column({ type: 'int', default: 0 })
  banned_to: number;

  @OneToOne(() => Organization, (org) => org.ownerUserEntity)
  orgOwnerEntity: Organization;

  @OneToMany(
    () => UsersInOrganizationEntity,
    (uio: UsersInOrganizationEntity) => uio.userEntityId,
  )
  userInOrganizationEntities: UsersInOrganizationEntity[];

  orgSelectedId: number;
  orgEntities: Organization[];
  rights: RightsDto;
  isActive: boolean;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
