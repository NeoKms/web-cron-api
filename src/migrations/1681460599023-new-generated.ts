import { MigrationInterface, QueryRunner } from 'typeorm';

export class newGenerated1681460599023 implements MigrationInterface {
  name = 'newGenerated1681460599023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ssh\` DROP FOREIGN KEY \`FK_840c9422c9dbac17524dcbccd33\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ssh\` CHANGE \`userEntityId\` \`orgEntityId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ssh\` ADD CONSTRAINT \`FK_505251dad5c1a1c63521b91c2a8\` FOREIGN KEY (\`orgEntityId\`) REFERENCES \`organization\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ssh\` DROP FOREIGN KEY \`FK_505251dad5c1a1c63521b91c2a8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ssh\` CHANGE \`orgEntityId\` \`userEntityId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ssh\` ADD CONSTRAINT \`FK_840c9422c9dbac17524dcbccd33\` FOREIGN KEY (\`userEntityId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
