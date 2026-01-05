import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767027712883 implements MigrationInterface {
    name = 'Migration1767027712883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_offerings" DROP CONSTRAINT "FK_2511a9592d5bbe17b9add4c9980"`);
        await queryRunner.query(`CREATE TABLE "service_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a3b04f24bf14a799a3375750bd1" UNIQUE ("title"), CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "supported_company_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ad8b51830bde0ba7c564278506a" UNIQUE ("title"), CONSTRAINT "PK_f060be331c54abd51d30b2619b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."media_usages_owner_type_enum" AS ENUM('SPECIALIST', 'SERVICE')`);
        await queryRunner.query(`CREATE TABLE "media_usages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_type" "public"."media_usages_owner_type_enum" NOT NULL, "owner_id" character varying NOT NULL, "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "mediaId" uuid, CONSTRAINT "PK_4f2b0601c29059c579f73feaa50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6ea4708d2c94c32b9004cf5fd9" ON "media_usages" ("owner_id", "owner_type") `);
        await queryRunner.query(`CREATE TYPE "public"."media_mime_type_enum" AS ENUM('image/jpeg', 'image/png', 'image/webp')`);
        await queryRunner.query(`CREATE TYPE "public"."media_media_type_enum" AS ENUM('THUMBNAIL', 'BANNER', 'GALLERY', 'ICON', 'AVATAR')`);
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "file_size" integer NOT NULL, "mime_type" "public"."media_mime_type_enum" NOT NULL, "media_type" "public"."media_media_type_enum" NOT NULL, "trash" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."platform_fee_tier_name_enum" AS ENUM('BASIC', 'STANDARD', 'PREMIUM')`);
        await queryRunner.query(`CREATE TABLE "platform_fee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tier_name" "public"."platform_fee_tier_name_enum" NOT NULL, "min_value" integer NOT NULL, "max_value" integer NOT NULL, "platform_fee_percentage" numeric(5,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_543382477c71fa71870b22c6dd9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "specialist_company_types" ("specialistsId" uuid NOT NULL, "supportedCompanyTypesId" uuid NOT NULL, CONSTRAINT "PK_1144adb5bb8374657d9591ac9bf" PRIMARY KEY ("specialistsId", "supportedCompanyTypesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_70f315d206563d2c368a8da1f9" ON "specialist_company_types" ("specialistsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2909bc699ba922052949209182" ON "specialist_company_types" ("supportedCompanyTypesId") `);
        await queryRunner.query(`CREATE TABLE "specialist_service_offerings" ("specialistsId" uuid NOT NULL, "serviceOfferingsId" uuid NOT NULL, CONSTRAINT "PK_7f43fc38f27abf9ec9ee3ee9726" PRIMARY KEY ("specialistsId", "serviceOfferingsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cdf2aee3b5faac876c293375db" ON "specialist_service_offerings" ("specialistsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4333409b92bf13c76f2ba66f74" ON "specialist_service_offerings" ("serviceOfferingsId") `);
        await queryRunner.query(`ALTER TABLE "service_offerings" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "service_offerings" DROP COLUMN "specialistId"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "display_order"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "slug" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD CONSTRAINT "UQ_960f146489f26f76b120a526bca" UNIQUE ("slug")`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "description" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "base_price" numeric(10,2) NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."specialists_verification_status_enum" AS ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "verification_status" "public"."specialists_verification_status_enum" NOT NULL DEFAULT 'DRAFT'`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "is_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "duration_days" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "is_draft" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "trash" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "service_category_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_offerings" DROP CONSTRAINT "PK_9b854841d82dd234996e82399e8"`);
        await queryRunner.query(`ALTER TABLE "service_offerings" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "service_offerings" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "service_offerings" ADD CONSTRAINT "PK_9b854841d82dd234996e82399e8" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP CONSTRAINT "PK_4bd10b339bf051026c8b6543911"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD CONSTRAINT "PK_4bd10b339bf051026c8b6543911" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD CONSTRAINT "FK_efefe3e28761b0eecde5d641c86" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "media_usages" ADD CONSTRAINT "FK_9abcd457955fee6321cb5097c5e" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "specialist_company_types" ADD CONSTRAINT "FK_70f315d206563d2c368a8da1f93" FOREIGN KEY ("specialistsId") REFERENCES "specialists"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "specialist_company_types" ADD CONSTRAINT "FK_2909bc699ba9220529492091827" FOREIGN KEY ("supportedCompanyTypesId") REFERENCES "supported_company_types"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "specialist_service_offerings" ADD CONSTRAINT "FK_cdf2aee3b5faac876c293375db6" FOREIGN KEY ("specialistsId") REFERENCES "specialists"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "specialist_service_offerings" ADD CONSTRAINT "FK_4333409b92bf13c76f2ba66f74f" FOREIGN KEY ("serviceOfferingsId") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specialist_service_offerings" DROP CONSTRAINT "FK_4333409b92bf13c76f2ba66f74f"`);
        await queryRunner.query(`ALTER TABLE "specialist_service_offerings" DROP CONSTRAINT "FK_cdf2aee3b5faac876c293375db6"`);
        await queryRunner.query(`ALTER TABLE "specialist_company_types" DROP CONSTRAINT "FK_2909bc699ba9220529492091827"`);
        await queryRunner.query(`ALTER TABLE "specialist_company_types" DROP CONSTRAINT "FK_70f315d206563d2c368a8da1f93"`);
        await queryRunner.query(`ALTER TABLE "media_usages" DROP CONSTRAINT "FK_9abcd457955fee6321cb5097c5e"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP CONSTRAINT "FK_efefe3e28761b0eecde5d641c86"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP CONSTRAINT "PK_4bd10b339bf051026c8b6543911"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD CONSTRAINT "PK_4bd10b339bf051026c8b6543911" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "service_offerings" DROP CONSTRAINT "PK_9b854841d82dd234996e82399e8"`);
        await queryRunner.query(`ALTER TABLE "service_offerings" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "service_offerings" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_offerings" ADD CONSTRAINT "PK_9b854841d82dd234996e82399e8" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "service_category_id"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "trash"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "is_draft"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "duration_days"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "is_verified"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "verification_status"`);
        await queryRunner.query(`DROP TYPE "public"."specialists_verification_status_enum"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "base_price"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP CONSTRAINT "UQ_960f146489f26f76b120a526bca"`);
        await queryRunner.query(`ALTER TABLE "specialists" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "is_active" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD "display_order" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_offerings" ADD "specialistId" integer`);
        await queryRunner.query(`ALTER TABLE "service_offerings" ADD "price" numeric NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4333409b92bf13c76f2ba66f74"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cdf2aee3b5faac876c293375db"`);
        await queryRunner.query(`DROP TABLE "specialist_service_offerings"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2909bc699ba922052949209182"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70f315d206563d2c368a8da1f9"`);
        await queryRunner.query(`DROP TABLE "specialist_company_types"`);
        await queryRunner.query(`DROP TABLE "platform_fee"`);
        await queryRunner.query(`DROP TYPE "public"."platform_fee_tier_name_enum"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TYPE "public"."media_media_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."media_mime_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6ea4708d2c94c32b9004cf5fd9"`);
        await queryRunner.query(`DROP TABLE "media_usages"`);
        await queryRunner.query(`DROP TYPE "public"."media_usages_owner_type_enum"`);
        await queryRunner.query(`DROP TABLE "supported_company_types"`);
        await queryRunner.query(`DROP TABLE "service_categories"`);
        await queryRunner.query(`ALTER TABLE "service_offerings" ADD CONSTRAINT "FK_2511a9592d5bbe17b9add4c9980" FOREIGN KEY ("specialistId") REFERENCES "specialists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
