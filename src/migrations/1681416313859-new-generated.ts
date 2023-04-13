import { MigrationInterface, QueryRunner } from 'typeorm';

export class newGenerated1681416313859 implements MigrationInterface {
  name = 'newGenerated1681416313859';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`organization\` DROP FOREIGN KEY \`FK_edb68829d9b83d8bd4c8babc432\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`organization\` CHANGE \`ownerEntityId\` \`ownerUserEntityId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`organization\` ADD UNIQUE INDEX \`IDX_a419e76372434b27502bf8489e\` (\`ownerUserEntityId\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_a419e76372434b27502bf8489e\` ON \`organization\` (\`ownerUserEntityId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`organization\` ADD CONSTRAINT \`FK_a419e76372434b27502bf8489e2\` FOREIGN KEY (\`ownerUserEntityId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`organization\` DROP FOREIGN KEY \`FK_a419e76372434b27502bf8489e2\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_a419e76372434b27502bf8489e\` ON \`organization\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`organization\` DROP INDEX \`IDX_a419e76372434b27502bf8489e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`organization\` CHANGE \`ownerUserEntityId\` \`ownerEntityId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`organization\` ADD CONSTRAINT \`FK_edb68829d9b83d8bd4c8babc432\` FOREIGN KEY (\`ownerEntityId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
