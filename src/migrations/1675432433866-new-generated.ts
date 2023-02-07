import { MigrationInterface, QueryRunner } from 'typeorm';
import { hashPassword } from '../helpers/constants';

export class newGenerated1675432433866 implements MigrationInterface {
  name = 'newGenerated1675432433866';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fio\` text NOT NULL, \`login\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`rights\` longtext NOT NULL DEFAULT '{}', \`login_timestamp\` int NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`login_cnt\` int NOT NULL DEFAULT '0', \`banned_to\` int NOT NULL DEFAULT '0', UNIQUE INDEX \`IDX_8e1f623798118e629b46a9e629\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      'insert into user (fio,login,password_hash,phone,rights) values (?,?,?,?,?)',
      [
        'admin',
        process.env.INIT_ADMIN_LOGIN || 'admin',
        hashPassword(process.env.INIT_ADMIN_PASSWORD || 'admin'),
        '79111111111',
        JSON.stringify({ users: 2 }),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_8e1f623798118e629b46a9e629\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
