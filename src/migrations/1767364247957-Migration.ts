import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767364247957 implements MigrationInterface {
    name = 'Migration1767364247957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service_offerings_master_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "s3_key" character varying, "bucket_name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_232d2178fd66e20b56fe82ca3f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_offerings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "specialists" uuid, "service_offerings_master_list_id" uuid, CONSTRAINT "PK_9b854841d82dd234996e82399e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "status" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "status" boolean NOT NULL DEFAULT true, "isVerified" boolean NOT NULL DEFAULT false, "trash" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "roleId" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."media_media_type_enum" AS ENUM('THUMBNAIL', 'BANNER', 'GALLERY', 'ICON', 'AVATAR')`);
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "file_size" integer NOT NULL, "display_order" integer NOT NULL DEFAULT '0', "mime_type" character varying NOT NULL, "media_type" "public"."media_media_type_enum" NOT NULL, "uploaded_at" TIMESTAMP NOT NULL, "deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "specialists" uuid, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."specialists_verification_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "specialists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "average_rating" numeric(3,2) NOT NULL DEFAULT '0', "is_draft" boolean NOT NULL DEFAULT true, "total_number_of_ratings" integer NOT NULL DEFAULT '0', "title" character varying NOT NULL, "slug" character varying NOT NULL, "description" text NOT NULL, "base_price" numeric(10,2) NOT NULL, "platform_fee" numeric(10,2), "final_price" numeric(10,2), "verification_status" "public"."specialists_verification_status_enum" NOT NULL DEFAULT 'PENDING', "is_verified" boolean NOT NULL DEFAULT false, "duration_days" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, CONSTRAINT "UQ_960f146489f26f76b120a526bca" UNIQUE ("slug"), CONSTRAINT "PK_4bd10b339bf051026c8b6543911" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."platform_fee_tier_name_enum" AS ENUM('BASIC', 'STANDARD', 'PREMIUM')`);
        await queryRunner.query(`CREATE TABLE "platform_fee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tier_name" "public"."platform_fee_tier_name_enum" NOT NULL, "min_value" integer NOT NULL, "max_value" integer NOT NULL, "platform_fee_percentage" numeric(5,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_543382477c71fa71870b22c6dd9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service_offerings" ADD CONSTRAINT "FK_8ab0fc8c713f36632c65e61511d" FOREIGN KEY ("specialists") REFERENCES "specialists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_offerings" ADD CONSTRAINT "FK_de1e181598a2f48344c82754999" FOREIGN KEY ("service_offerings_master_list_id") REFERENCES "service_offerings_master_list"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_81c0d1cbdf05ee9d39a49ce2614" FOREIGN KEY ("specialists") REFERENCES "specialists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "specialists" ADD CONSTRAINT "FK_11cca23b10d025e267bbbce23cf" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specialists" DROP CONSTRAINT "FK_11cca23b10d025e267bbbce23cf"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_81c0d1cbdf05ee9d39a49ce2614"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`);
        await queryRunner.query(`ALTER TABLE "service_offerings" DROP CONSTRAINT "FK_de1e181598a2f48344c82754999"`);
        await queryRunner.query(`ALTER TABLE "service_offerings" DROP CONSTRAINT "FK_8ab0fc8c713f36632c65e61511d"`);
        await queryRunner.query(`DROP TABLE "platform_fee"`);
        await queryRunner.query(`DROP TYPE "public"."platform_fee_tier_name_enum"`);
        await queryRunner.query(`DROP TABLE "specialists"`);
        await queryRunner.query(`DROP TYPE "public"."specialists_verification_status_enum"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TYPE "public"."media_media_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "service_offerings"`);
        await queryRunner.query(`DROP TABLE "service_offerings_master_list"`);
    }

}
