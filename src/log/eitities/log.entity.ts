import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { ContentDto } from '../dto/content.dto';
import { LogStatusesType } from '../../helpers/interfaces/log';
@Entity()
export class Log {
  @PrimaryColumn({ nullable: false })
  timestamp_start: number;
  @ManyToOne(() => Job, (job) => job.logEntities, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'jobEntityId' })
  jobEntity: Job;
  @PrimaryColumn({ nullable: false })
  jobEntityId: number;
  @Column('tinyint', { default: 0 })
  isDel: number;
  @Column({ nullable: true })
  public timestamp_end: number;
  @Column({
    type: 'json',
    nullable: false,
    default: JSON.stringify({ text: '', error: '' }),
  })
  public content: ContentDto;
  @Column('tinyint', {
    comment: '1=in progress, 2=finish success, 3=finish with error',
    default: 1,
  })
  public status: LogStatusesType;
  constructor(partial: Partial<Log>) {
    Object.assign(this, partial);
  }
}
