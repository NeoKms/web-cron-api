import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { defaultRights } from '../../helpers/constants';
import RightsDto from '../../auth/dto/rights.dto';
import { Organization } from './organization.entity';

@Entity()
export class UsersInOrganizationEntity {
  @ManyToOne(() => User, (user: User) => user.userInOrganizationEntities, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userEntityId' })
  @PrimaryColumn()
  userEntityId: number;

  @ManyToOne(
    () => Organization,
    (org: Organization) => org.userInOrganizationEntities,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'organizationEntityId' })
  @PrimaryColumn()
  organizationEntityId: number;

  userEntities: User[];

  orgEntities: Organization[];

  @Column({ type: 'json', default: JSON.stringify(defaultRights) })
  rights: RightsDto;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  constructor(partial: Partial<UsersInOrganizationEntity>) {
    Object.assign(this, partial);
  }
}
