import { MigrationInterface, QueryRunner } from 'typeorm';

export class newGenerated1678891815886 implements MigrationInterface {
  name = 'newGenerated1678891815886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`job\` (\`id\` int NOT NULL AUTO_INCREMENT, \`job\` varchar(255) NOT NULL, \`time\` text NOT NULL, \`isActive\` tinyint NOT NULL, \`sshEntityId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD CONSTRAINT \`FK_e7f5a3abe95ec1ca0208914499f\` FOREIGN KEY (\`sshEntityId\`) REFERENCES \`ssh\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_e7f5a3abe95ec1ca0208914499f\``,
    );
    await queryRunner.query(`DROP TABLE \`job\``);
  }
}
