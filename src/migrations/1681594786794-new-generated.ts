import { MigrationInterface, QueryRunner } from 'typeorm';

export class newGenerated1681594786794 implements MigrationInterface {
  name = 'newGenerated1681594786794';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_a62473490b3e4578fd683235c5\` ON \`user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`login\` \`email\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email\``);
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`email\` text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\``,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email\``);
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`email\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`email\` \`login\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_a62473490b3e4578fd683235c5\` ON \`user\` (\`login\`)`,
    );
  }
}
