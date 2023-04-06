import { MigrationInterface, QueryRunner } from 'typeorm';
import { defaultRights, hashPassword } from '../helpers/constants';

export class newGenerated1680812767222 implements MigrationInterface {
  name = 'newGenerated1680812767222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fio\` text NOT NULL, \`login\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`rights\` longtext NOT NULL DEFAULT '{"servers":0,"logs":0,"jobs":0,"users":0,"ssh":0}', \`login_timestamp\` int NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`login_cnt\` int NOT NULL DEFAULT '0', \`banned_to\` int NOT NULL DEFAULT '0', UNIQUE INDEX \`IDX_8e1f623798118e629b46a9e629\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ssh\` (\`id\` int NOT NULL AUTO_INCREMENT, \`host\` text NOT NULL, \`port\` int NOT NULL, \`username\` text NOT NULL, \`description\` text NOT NULL, \`created_at\` int NOT NULL, \`updated_at\` int NULL, \`deleted_at\` int NULL, \`userEntityId\` int NOT NULL, UNIQUE INDEX \`IDX_5f9264019635e046b092f49c54\` (\`host\`, \`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`job\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sshEntityId\` int NOT NULL, \`job\` varchar(255) NOT NULL, \`time\` longtext NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT '1', \`isDel\` tinyint NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`log\` (\`timestamp_start\` int NOT NULL, \`jobEntityId\` int NOT NULL, \`isDel\` tinyint NOT NULL DEFAULT '0', \`timestamp_end\` int NULL, \`content\` longtext NOT NULL, \`status\` tinyint NOT NULL COMMENT '1=in progress, 2=finish success, 3=finish with error' DEFAULT '1', PRIMARY KEY (\`timestamp_start\`, \`jobEntityId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ssh\` ADD CONSTRAINT \`FK_840c9422c9dbac17524dcbccd33\` FOREIGN KEY (\`userEntityId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD CONSTRAINT \`FK_e7f5a3abe95ec1ca0208914499f\` FOREIGN KEY (\`sshEntityId\`) REFERENCES \`ssh\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`log\` ADD CONSTRAINT \`FK_0d77dc6b44db0da029d2109e185\` FOREIGN KEY (\`jobEntityId\`) REFERENCES \`job\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      'insert into user (fio,login,password_hash,phone,rights) values (?,?,?,?,?)',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`log\` DROP FOREIGN KEY \`FK_0d77dc6b44db0da029d2109e185\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_e7f5a3abe95ec1ca0208914499f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ssh\` DROP FOREIGN KEY \`FK_840c9422c9dbac17524dcbccd33\``,
    );
    await queryRunner.query(`DROP TABLE \`log\``);
    await queryRunner.query(`DROP TABLE \`job\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5f9264019635e046b092f49c54\` ON \`ssh\``,
    );
    await queryRunner.query(`DROP TABLE \`ssh\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_8e1f623798118e629b46a9e629\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
