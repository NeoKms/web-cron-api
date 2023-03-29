import { MigrationInterface, QueryRunner } from "typeorm";

export class newGenerated1680101655728 implements MigrationInterface {
    name = 'newGenerated1680101655728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_e7f5a3abe95ec1ca0208914499f\``);
        await queryRunner.query(`ALTER TABLE \`job\` CHANGE \`sshEntityId\` \`sshEntityId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ssh\` DROP FOREIGN KEY \`FK_840c9422c9dbac17524dcbccd33\``);
        await queryRunner.query(`ALTER TABLE \`ssh\` CHANGE \`userEntityId\` \`userEntityId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`job\` ADD CONSTRAINT \`FK_e7f5a3abe95ec1ca0208914499f\` FOREIGN KEY (\`sshEntityId\`) REFERENCES \`ssh\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ssh\` ADD CONSTRAINT \`FK_840c9422c9dbac17524dcbccd33\` FOREIGN KEY (\`userEntityId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ssh\` DROP FOREIGN KEY \`FK_840c9422c9dbac17524dcbccd33\``);
        await queryRunner.query(`ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_e7f5a3abe95ec1ca0208914499f\``);
        await queryRunner.query(`ALTER TABLE \`ssh\` CHANGE \`userEntityId\` \`userEntityId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`ssh\` ADD CONSTRAINT \`FK_840c9422c9dbac17524dcbccd33\` FOREIGN KEY (\`userEntityId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`job\` CHANGE \`sshEntityId\` \`sshEntityId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`job\` ADD CONSTRAINT \`FK_e7f5a3abe95ec1ca0208914499f\` FOREIGN KEY (\`sshEntityId\`) REFERENCES \`ssh\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
