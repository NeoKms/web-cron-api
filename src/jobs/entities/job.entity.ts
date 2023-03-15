import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ssh } from '../../ssh/entities/ssh.entity';
import { CronTimer } from '../../helpers/interfaces/jobs';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  public id: number;
  @ManyToOne(() => Ssh, (ssh) => ssh.jobEntities)
  @JoinColumn()
  public sshEntity: Ssh;
  @Column()
  public job: string;
  @Column('text')
  public time: CronTimer;
  @Column('tinyint')
  public isActive: number;
}
