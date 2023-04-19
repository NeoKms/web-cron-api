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
  id: number;
  @ManyToOne(() => Ssh, (ssh) => ssh.jobEntities, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'sshEntityId' })
  sshEntity: Ssh;
  @Column()
  sshEntityId: number;
  @Column({ nullable: false })
  job: string;
  @Column({ type: 'json', nullable: false })
  time: CronTimerDto;
  @Column('tinyint', { default: 1 })
  isActive: number;
  @Column('tinyint', { default: 0 })
  isDel: number;
  @OneToMany(() => Log, (log) => log.jobEntityId)
  logEntities: Log[];

  constructor(partial: Partial<Job>) {
    Object.assign(this, partial);
  }
}
