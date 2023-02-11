import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SshEntity {
  @PrimaryGeneratedColumn()
  public id: number;
}
