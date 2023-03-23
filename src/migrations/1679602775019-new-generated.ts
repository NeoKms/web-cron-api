import { MigrationInterface, QueryRunner } from "typeorm";

export class newGenerated1679602775019 implements MigrationInterface {
    name = 'newGenerated1679602775019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`time\``);
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`time\` longtext NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`time\``);
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`time\` text NOT NULL`);
    }

}
