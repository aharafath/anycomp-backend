import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767437774852 implements MigrationInterface {
    name = 'Migration1767437774852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specialists" DROP CONSTRAINT "FK_11cca23b10d025e267bbbce23cf"`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD CONSTRAINT "FK_11cca23b10d025e267bbbce23cf" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specialists" DROP CONSTRAINT "FK_11cca23b10d025e267bbbce23cf"`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD CONSTRAINT "FK_11cca23b10d025e267bbbce23cf" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
