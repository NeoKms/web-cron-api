import { MigrationInterface, QueryRunner } from "typeorm";

export class newGenerated1676152339961 implements MigrationInterface {
    name = 'newGenerated1676152339961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`ssh_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`host\` text NOT NULL, \`port\` int NOT NULL, \`username\` text NOT NULL, \`description\` text NOT NULL, \`privateKeyPath\` text NOT NULL, \`created_at\` int NOT NULL, \`updated_at\` int NULL, \`deleted_at\` int NULL, \`userEntityId\` int NULL, UNIQUE INDEX \`IDX_638467c5174900fbef983abe8b\` (\`host\`, \`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`rights\` \`rights\` longtext NOT NULL DEFAULT '{"servers":0,"logs":0,"jobs":0,"users":0,"ssh":0}'`);
        await queryRunner.query(`ALTER TABLE \`ssh_entity\` ADD CONSTRAINT \`FK_64ba2427809b1551381aba068ee\` FOREIGN KEY (\`userEntityId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ssh_entity\` DROP FOREIGN KEY \`FK_64ba2427809b1551381aba068ee\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`rights\` \`rights\` longtext NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX \`IDX_638467c5174900fbef983abe8b\` ON \`ssh_entity\``);
        await queryRunner.query(`DROP TABLE \`ssh_entity\``);
    }

}
