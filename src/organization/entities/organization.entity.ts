import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'text', nullable: false })
  public name: string;

  @Column({ type: 'int', nullable: false })
  public created_at: number;

  @OneToOne(() => User, (user) => user.orgOwnerEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerUserEntityId' })
  public ownerUserEntity: User;

  @Column()
  public ownerUserEntityId: number;

  @ManyToMany(() => User, (user) => user.orgEntities)
  @JoinTable({ name: 'organization_user_list' })
  public userEntities: User[];

  constructor(partial: Partial<Organization>) {
    Object.assign(this, partial);
  }
}
