import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { defaultRights } from '../../helpers/constants';
import RightsDto from '../../auth/dto/rights.dto';
import { Ssh } from '../../ssh/entities/ssh.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('text')
  public fio: string;

  @Column({ unique: true })
  public login: string;

  @Column()
  public password_hash: string;

  @Column({ type: 'varchar', unique: true })
  public phone: string;

  @Column({ type: 'json', default: JSON.stringify(defaultRights) })
  public rights: RightsDto;

  @Column({ type: 'int', nullable: true })
  public login_timestamp: number;

  @Column({ type: 'boolean', default: true })
  public active: boolean;

  @Column({ type: 'int', default: 0 })
  public login_cnt: number;

  @Column({ type: 'int', default: 0 })
  public banned_to: number;

  @OneToMany(() => Ssh, (ssh) => ssh.userEntity)
  sshEntities: Ssh;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
