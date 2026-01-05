import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767117441560 implements MigrationInterface {
    name = 'Migration1767117441560'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."media_mime_type_enum" RENAME TO "media_mime_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."media_mime_type_enum" AS ENUM('image/jpeg', 'image/png', 'image/webp', 'image/svg+xml')`);
        await queryRunner.query(`ALTER TABLE "media" ALTER COLUMN "mime_type" TYPE "public"."media_mime_type_enum" USING "mime_type"::"text"::"public"."media_mime_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."media_mime_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."media_mime_type_enum_old" AS ENUM('image/jpeg', 'image/png', 'image/webp', 'image/svg')`);
        await queryRunner.query(`ALTER TABLE "media" ALTER COLUMN "mime_type" TYPE "public"."media_mime_type_enum_old" USING "mime_type"::"text"::"public"."media_mime_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."media_mime_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."media_mime_type_enum_old" RENAME TO "media_mime_type_enum"`);
    }

}
