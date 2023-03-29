import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ssh } from '../../ssh/entities/ssh.entity';
import { CronTimerDto } from '../dto/cron-timer.dto';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  public id: number;
  @ManyToOne(() => Ssh, (ssh) => ssh.jobEntities)
  @JoinColumn({ name: 'sshEntityId' })
  public sshEntity: Ssh;
  @Column()
  public sshEntityId: number;
  @Column()
  public job: string;
  @Column({ type: 'json' })
  public time: CronTimerDto;
  @Column('tinyint')
  public isActive: number;
  @Column('tinyint')
  public isDel: number;

  constructor(partial: Partial<Job>) {
    Object.assign(this, partial);
  }
}
