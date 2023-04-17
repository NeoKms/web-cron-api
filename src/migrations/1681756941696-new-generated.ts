import { MigrationInterface, QueryRunner } from 'typeorm';

export class newGenerated1681756941696 implements MigrationInterface {
  name = 'newGenerated1681756941696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users_in_organization_entity\` (\`userEntityId\` int NOT NULL, \`organizationEntityId\` int NOT NULL, \`rights\` longtext NOT NULL DEFAULT '{"logs":0,"jobs":0,"users":0,"ssh":0,"organization":0}', \`isActive\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`userEntityId\`, \`organizationEntityId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`rights\``);
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`active\``);
    await queryRunner.query(
      `ALTER TABLE \`users_in_organization_entity\` ADD CONSTRAINT \`FK_fb733a4b3484cde858953ba4a05\` FOREIGN KEY (\`userEntityId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_in_organization_entity\` ADD CONSTRAINT \`FK_38da292f0cc1a1e4c34537f73d0\` FOREIGN KEY (\`organizationEntityId\`) REFERENCES \`organization\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users_in_organization_entity\` DROP FOREIGN KEY \`FK_38da292f0cc1a1e4c34537f73d0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_in_organization_entity\` DROP FOREIGN KEY \`FK_fb733a4b3484cde858953ba4a05\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`active\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`rights\` longtext NOT NULL DEFAULT '{"logs":0,"jobs":0,"users":0,"ssh":0,"organization":0}'`,
    );
    await queryRunner.query(`DROP TABLE \`users_in_organization_entity\``);
  }
}
