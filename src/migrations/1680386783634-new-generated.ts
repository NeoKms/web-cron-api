import { MigrationInterface, QueryRunner } from "typeorm";

export class newGenerated1680386783634 implements MigrationInterface {
    name = 'newGenerated1680386783634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`log\` (\`timestamp_start\` int NOT NULL, \`jobEntityId\` int NOT NULL, \`isDel\` tinyint NOT NULL DEFAULT '0', \`timestamp_end\` int NULL, \`content\` longtext NOT NULL, \`status\` tinyint NOT NULL COMMENT '1=in progress, 2=finish success, 3=finish with error' DEFAULT '1', PRIMARY KEY (\`timestamp_start\`, \`jobEntityId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`log\` ADD CONSTRAINT \`FK_0d77dc6b44db0da029d2109e185\` FOREIGN KEY (\`jobEntityId\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`log\` DROP FOREIGN KEY \`FK_0d77dc6b44db0da029d2109e185\``);
        await queryRunner.query(`DROP TABLE \`log\``);
    }

}
