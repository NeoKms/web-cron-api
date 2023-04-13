import { MigrationInterface, QueryRunner } from 'typeorm';

export class newGenerated1681391668952 implements MigrationInterface {
  name = 'newGenerated1681391668952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`organization\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` text NOT NULL, \`created_at\` int NOT NULL, \`ownerEntityId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_a62473490b3e4578fd683235c5\` (\`login\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`rights\` \`rights\` longtext NOT NULL DEFAULT '{"logs":0,"jobs":0,"users":0,"ssh":0,"organization":0}'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ssh\` CHANGE \`port\` \`port\` int NOT NULL DEFAULT '22'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ssh\` CHANGE \`description\` \`description\` text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`log\` CHANGE \`content\` \`content\` longtext NOT NULL DEFAULT '{"text":"","error":""}'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`organization\` ADD CONSTRAINT \`FK_edb68829d9b83d8bd4c8babc432\` FOREIGN KEY (\`ownerEntityId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`organization\` DROP FOREIGN KEY \`FK_edb68829d9b83d8bd4c8babc432\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`log\` CHANGE \`content\` \`content\` longtext NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ssh\` CHANGE \`description\` \`description\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ssh\` CHANGE \`port\` \`port\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`rights\` \`rights\` longtext NOT NULL DEFAULT '{"servers":0,"logs":0,"jobs":0,"users":0,"ssh":0}'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_a62473490b3e4578fd683235c5\``,
    );
    await queryRunner.query(`DROP TABLE \`organization\``);
  }
}
