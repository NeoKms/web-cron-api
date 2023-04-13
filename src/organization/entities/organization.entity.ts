import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
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

  @ManyToOne(() => User, (user) => user.orgOwnerEntities, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerEntityId' })
  public ownerEntity: User;

  @Column()
  public ownerEntityId: number;

  @ManyToMany(() => User, (user) => user.orgEntities)
  userEntities: User;
  constructor(partial: Partial<Organization>) {
    Object.assign(this, partial);
  }
}
