import { MigrationInterface, QueryRunner } from 'typeorm';

export class newGenerated1680209808294 implements MigrationInterface {
  name = 'newGenerated1680209808294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` CHANGE \`isActive\` \`isActive\` tinyint NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` CHANGE \`isDel\` \`isDel\` tinyint NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` CHANGE \`isDel\` \`isDel\` tinyint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` CHANGE \`isActive\` \`isActive\` tinyint NOT NULL`,
    );
  }
}
