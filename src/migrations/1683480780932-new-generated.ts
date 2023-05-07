import { MigrationInterface, QueryRunner } from "typeorm";

export class newGenerated1683480780932 implements MigrationInterface {
    name = 'newGenerated1683480780932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`name\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`name\``);
    }

}
