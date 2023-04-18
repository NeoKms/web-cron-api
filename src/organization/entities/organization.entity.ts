import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { UsersInOrganizationEntity } from './usersInOrganization.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  created_at: number;

  @OneToOne(() => User, (user) => user.orgOwnerEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerUserEntityId' })
  ownerUserEntity: User;

  @Column()
  ownerUserEntityId: number;

  @OneToMany(
    () => UsersInOrganizationEntity,
    (uio: UsersInOrganizationEntity) => uio.organizationEntityId,
  )
  userInOrganizationEntities: UsersInOrganizationEntity[];

  constructor(partial: Partial<Organization>) {
    Object.assign(this, partial);
  }
}
