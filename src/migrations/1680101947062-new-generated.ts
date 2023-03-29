import { MigrationInterface, QueryRunner } from "typeorm";

export class newGenerated1680101947062 implements MigrationInterface {
    name = 'newGenerated1680101947062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`isDel\` tinyint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`isDel\``);
    }

}
