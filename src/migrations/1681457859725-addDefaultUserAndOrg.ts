import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  defaultRights,
  getNowTimestampSec,
  hashPassword,
} from '../helpers/constants';

export class newGenerated1681457859725 implements MigrationInterface {
  name = 'newGenerated1681457859725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [user] = await queryRunner.query(
      'insert into user (id,fio,login,password_hash,phone,rights) values (1,?,?,?,?,?) returning id',
      [
        'admin',
        process.env.INIT_ADMIN_LOGIN || 'admin',
        hashPassword(process.env.INIT_ADMIN_PASSWORD || 'admin'),
        '79111111111',
        JSON.stringify(
          Object.keys(defaultRights).reduce((acc, key) => {
            acc[key] = 2;
            return acc;
          }, {}),
        ),
      ],
    );
    const [org] = await queryRunner.query(
      'insert into organization (id,name,created_at,ownerUserEntityId) values (1,?,?,?) returning id',
      [`org_${Date.now()}`, getNowTimestampSec(), user.id],
    );
    await queryRunner.query(
      'insert into organization_user_list (organizationId,userId) values (?,?)',
      [user.id, org.id],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('delete from user where id = 1');
    await queryRunner.query('delete from organization where id = 1');
    await queryRunner.query(
      'delete from organization_user_list where organizationId = 1 or userId = 1',
    );
  }
}
