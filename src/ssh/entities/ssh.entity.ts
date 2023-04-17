import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { Organization } from '../../organization/entities/organization.entity';

@Entity()
@Index(['host', 'username'], { unique: true })
export class Ssh {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('text')
  host: string;
  @Column({ type: 'int', default: 22 })
  port: number;
  @Column('text')
  username: string;
  @Column({ type: 'text', default: '' })
  description: string;
  @Column({ type: 'int' })
  created_at: number;
  @Column({ type: 'int', nullable: true })
  updated_at: number;
  @Column({ type: 'int', nullable: true })
  deleted_at: number;
  @ManyToOne(() => Organization, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'orgEntityId' })
  orgEntity: Organization;
  @Column()
  orgEntityId: number;
  @OneToMany(() => Job, (job) => job.sshEntity)
  jobEntities: Job[];
}
