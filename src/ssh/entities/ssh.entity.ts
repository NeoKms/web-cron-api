import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

@Entity()
@Index(['host', 'username'], { unique: true })
export class Ssh {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column('text')
  public host: string;
  @Column({ type: 'int', default: 22 })
  public port: number;
  @Column('text')
  public username: string;
  @Column({ type: 'text', default: '' })
  public description: string;
  @Column({ type: 'int' })
  public created_at: number;
  @Column({ type: 'int', nullable: true })
  public updated_at: number;
  @Column({ type: 'int', nullable: true })
  public deleted_at: number;
  @ManyToOne(() => User, (user) => user.sshEntities)
  @JoinColumn({ name: 'userEntityId' })
  public userEntity: User;
  @Column()
  public userEntityId: number;
  @OneToMany(() => Job, (job) => job.sshEntity)
  public jobEntities: Job[];
}
