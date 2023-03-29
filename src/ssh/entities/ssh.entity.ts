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
  @Column({ type: 'int' })
  public port: number;
  @Column('text')
  public username: string;
  @Column('text')
  public description: string;
  @Column({ type: 'int' })
  public created_at: number;
  @Column({ type: 'int', nullable: true })
  public updated_at: number;
  @Column({ type: 'int', nullable: true })
  public deleted_at: number;
  @ManyToOne(() => User, (user) => user.sshEntities)
  @JoinColumn()
  public userEntity: User;
  @OneToMany(() => Job, (job) => job.sshEntity)
  public jobEntities: Job[];
}
