import { MigrationInterface, QueryRunner } from 'typeorm';

export class newGenerated1681594866513 implements MigrationInterface {
  name = 'newGenerated1681594866513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`phone\` \`phone\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`phone\` \`phone\` varchar(255) NOT NULL`,
    );
  }
}
