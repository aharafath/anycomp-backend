import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSvgMimeType1767117192343 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE media_mime_type_enum
      ADD VALUE IF NOT EXISTS 'image/svg+xml'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
