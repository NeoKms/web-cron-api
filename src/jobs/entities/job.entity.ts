import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ssh } from '../../ssh/entities/ssh.entity';
import { CronTimerDto } from '../dto/cron-timer.dto';
import { Log } from '../../log/eitities/log.entity';

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
  @Column('tinyint', { default: 1 })
  public isActive: number;
  @Column('tinyint', { default: 0 })
  public isDel: number;
  @OneToMany(() => Log, (log) => log.jobEntityId)
  private logEntities: Log[];

  constructor(partial: Partial<Job>) {
    Object.assign(this, partial);
  }
}
