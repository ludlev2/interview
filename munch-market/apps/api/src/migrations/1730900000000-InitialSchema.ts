import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1730900000000 implements MigrationInterface {
  name = 'InitialSchema1730900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_role" AS ENUM('customer', 'staff', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "name" character varying NOT NULL,
        "role" "user_role" NOT NULL DEFAULT 'customer',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "min_days_on_arrival" integer NOT NULL,
        CONSTRAINT "UQ_category_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_category" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sku" character varying NOT NULL,
        "name" character varying NOT NULL,
        "brand" character varying NOT NULL,
        "category_id" integer NOT NULL,
        "image_url" character varying NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "list_price" numeric(10,2) NOT NULL,
        "unit_label" character varying NOT NULL,
        "minimum_orderable_unit" integer NOT NULL DEFAULT 1,
        "order_increment" integer NOT NULL DEFAULT 1,
        "is_age_restricted" boolean NOT NULL DEFAULT false,
        "stock" integer NOT NULL DEFAULT 0,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_product_sku" UNIQUE ("sku"),
        CONSTRAINT "PK_product" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_category" FOREIGN KEY ("category_id") REFERENCES "category"("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "stock_batch" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "batch_code" character varying NOT NULL,
        "best_before" date NOT NULL,
        "quantity" integer NOT NULL,
        "received_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_batch" PRIMARY KEY ("id"),
        CONSTRAINT "FK_stock_batch_product" FOREIGN KEY ("product_id") REFERENCES "product"("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_status" AS ENUM('pending_payment', 'paid', 'picking', 'shipped', 'cancelled')`,
    );
    await queryRunner.query(`CREATE TYPE "carrier" AS ENUM('gls', 'posta')`);
    await queryRunner.query(
      `CREATE TABLE "order" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "customer_id" uuid NOT NULL,
        "status" "order_status" NOT NULL DEFAULT 'pending_payment',
        "carrier" "carrier" NOT NULL,
        "shipping_address" jsonb NOT NULL,
        "subtotal" numeric(10,2) NOT NULL,
        "shipping_fee" numeric(10,2) NOT NULL,
        "total" numeric(10,2) NOT NULL,
        "estimated_delivery" date NOT NULL,
        "payment_intent_id" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_customer" FOREIGN KEY ("customer_id") REFERENCES "user"("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_line" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_order_line" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_line_order" FOREIGN KEY ("order_id") REFERENCES "order"("id"),
        CONSTRAINT "FK_order_line_product" FOREIGN KEY ("product_id") REFERENCES "product"("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TYPE "fulfilment_task_status" AS ENUM('open', 'picked', 'shipped')`,
    );
    await queryRunner.query(
      `CREATE TABLE "fulfilment_task" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "status" "fulfilment_task_status" NOT NULL DEFAULT 'open',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fulfilment_task" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fulfilment_task_order" FOREIGN KEY ("order_id") REFERENCES "order"("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_customer" ON "order" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_stock_batch_product" ON "stock_batch" ("product_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "fulfilment_task"`);
    await queryRunner.query(`DROP TYPE "fulfilment_task_status"`);
    await queryRunner.query(`DROP TABLE "order_line"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TYPE "carrier"`);
    await queryRunner.query(`DROP TYPE "order_status"`);
    await queryRunner.query(`DROP TABLE "stock_batch"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "user_role"`);
  }
}
