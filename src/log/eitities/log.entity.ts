import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { ContentDto } from '../dto/content.dto';
@Entity()
export class Log {
  @PrimaryColumn()
  public timestamp_start: number;
  @ManyToOne(() => Job, (job) => job)
  @JoinColumn({ name: 'jobEntityId' })
  public jobEntity: Job;
  @PrimaryColumn()
  public jobEntityId: number;
  @Column('tinyint', { default: 0 })
  public isDel: number;
  @Column({ nullable: true })
  public timestamp_end: number;
  @Column('json')
  public content: ContentDto;
  @Column('tinyint', {
    comment: '1=in progress, 2=finish success, 3=finish with error',
    default: 1,
  })
  public status: number;
  constructor(partial: Partial<Log>) {
    Object.assign(this, partial);
  }
}
