import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hospital_info" ADD COLUMN "updated_by_id" integer;
  ALTER TABLE "_hospital_info_v" ADD COLUMN "version_updated_by_id" integer;
  ALTER TABLE "departments" ADD COLUMN "updated_by_id" integer;
  ALTER TABLE "_departments_v" ADD COLUMN "version_updated_by_id" integer;
  ALTER TABLE "doctors" ADD COLUMN "updated_by_id" integer;
  ALTER TABLE "_doctors_v" ADD COLUMN "version_updated_by_id" integer;
  ALTER TABLE "testimonials" ADD COLUMN "updated_by_id" integer;
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_updated_by_id" integer;
  ALTER TABLE "videos" ADD COLUMN "updated_by_id" integer;
  ALTER TABLE "_videos_v" ADD COLUMN "version_updated_by_id" integer;
  ALTER TABLE "faqs" ADD COLUMN "updated_by_id" integer;
  ALTER TABLE "_faqs_v" ADD COLUMN "version_updated_by_id" integer;
  ALTER TABLE "insurers" ADD COLUMN "updated_by_id" integer;
  ALTER TABLE "_insurers_v" ADD COLUMN "version_updated_by_id" integer;
  ALTER TABLE "tpas" ADD COLUMN "updated_by_id" integer;
  ALTER TABLE "_tpas_v" ADD COLUMN "version_updated_by_id" integer;
  ALTER TABLE "schemes" ADD COLUMN "updated_by_id" integer;
  ALTER TABLE "_schemes_v" ADD COLUMN "version_updated_by_id" integer;
  ALTER TABLE "hospital_info" ADD CONSTRAINT "hospital_info_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hospital_info_v" ADD CONSTRAINT "_hospital_info_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments" ADD CONSTRAINT "departments_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_departments_v" ADD CONSTRAINT "_departments_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "doctors" ADD CONSTRAINT "doctors_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_doctors_v" ADD CONSTRAINT "_doctors_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v" ADD CONSTRAINT "_videos_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faqs_v" ADD CONSTRAINT "_faqs_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insurers" ADD CONSTRAINT "insurers_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insurers_v" ADD CONSTRAINT "_insurers_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tpas" ADD CONSTRAINT "tpas_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tpas_v" ADD CONSTRAINT "_tpas_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "schemes" ADD CONSTRAINT "schemes_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_schemes_v" ADD CONSTRAINT "_schemes_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "hospital_info_updated_by_idx" ON "hospital_info" USING btree ("updated_by_id");
  CREATE INDEX "_hospital_info_v_version_version_updated_by_idx" ON "_hospital_info_v" USING btree ("version_updated_by_id");
  CREATE INDEX "departments_updated_by_idx" ON "departments" USING btree ("updated_by_id");
  CREATE INDEX "_departments_v_version_version_updated_by_idx" ON "_departments_v" USING btree ("version_updated_by_id");
  CREATE INDEX "doctors_updated_by_idx" ON "doctors" USING btree ("updated_by_id");
  CREATE INDEX "_doctors_v_version_version_updated_by_idx" ON "_doctors_v" USING btree ("version_updated_by_id");
  CREATE INDEX "testimonials_updated_by_idx" ON "testimonials" USING btree ("updated_by_id");
  CREATE INDEX "_testimonials_v_version_version_updated_by_idx" ON "_testimonials_v" USING btree ("version_updated_by_id");
  CREATE INDEX "videos_updated_by_idx" ON "videos" USING btree ("updated_by_id");
  CREATE INDEX "_videos_v_version_version_updated_by_idx" ON "_videos_v" USING btree ("version_updated_by_id");
  CREATE INDEX "faqs_updated_by_idx" ON "faqs" USING btree ("updated_by_id");
  CREATE INDEX "_faqs_v_version_version_updated_by_idx" ON "_faqs_v" USING btree ("version_updated_by_id");
  CREATE INDEX "insurers_updated_by_idx" ON "insurers" USING btree ("updated_by_id");
  CREATE INDEX "_insurers_v_version_version_updated_by_idx" ON "_insurers_v" USING btree ("version_updated_by_id");
  CREATE INDEX "tpas_updated_by_idx" ON "tpas" USING btree ("updated_by_id");
  CREATE INDEX "_tpas_v_version_version_updated_by_idx" ON "_tpas_v" USING btree ("version_updated_by_id");
  CREATE INDEX "schemes_updated_by_idx" ON "schemes" USING btree ("updated_by_id");
  CREATE INDEX "_schemes_v_version_version_updated_by_idx" ON "_schemes_v" USING btree ("version_updated_by_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hospital_info" DROP CONSTRAINT "hospital_info_updated_by_id_users_id_fk";
  
  ALTER TABLE "_hospital_info_v" DROP CONSTRAINT "_hospital_info_v_version_updated_by_id_users_id_fk";
  
  ALTER TABLE "departments" DROP CONSTRAINT "departments_updated_by_id_users_id_fk";
  
  ALTER TABLE "_departments_v" DROP CONSTRAINT "_departments_v_version_updated_by_id_users_id_fk";
  
  ALTER TABLE "doctors" DROP CONSTRAINT "doctors_updated_by_id_users_id_fk";
  
  ALTER TABLE "_doctors_v" DROP CONSTRAINT "_doctors_v_version_updated_by_id_users_id_fk";
  
  ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_updated_by_id_users_id_fk";
  
  ALTER TABLE "_testimonials_v" DROP CONSTRAINT "_testimonials_v_version_updated_by_id_users_id_fk";
  
  ALTER TABLE "videos" DROP CONSTRAINT "videos_updated_by_id_users_id_fk";
  
  ALTER TABLE "_videos_v" DROP CONSTRAINT "_videos_v_version_updated_by_id_users_id_fk";
  
  ALTER TABLE "faqs" DROP CONSTRAINT "faqs_updated_by_id_users_id_fk";
  
  ALTER TABLE "_faqs_v" DROP CONSTRAINT "_faqs_v_version_updated_by_id_users_id_fk";
  
  ALTER TABLE "insurers" DROP CONSTRAINT "insurers_updated_by_id_users_id_fk";
  
  ALTER TABLE "_insurers_v" DROP CONSTRAINT "_insurers_v_version_updated_by_id_users_id_fk";
  
  ALTER TABLE "tpas" DROP CONSTRAINT "tpas_updated_by_id_users_id_fk";
  
  ALTER TABLE "_tpas_v" DROP CONSTRAINT "_tpas_v_version_updated_by_id_users_id_fk";
  
  ALTER TABLE "schemes" DROP CONSTRAINT "schemes_updated_by_id_users_id_fk";
  
  ALTER TABLE "_schemes_v" DROP CONSTRAINT "_schemes_v_version_updated_by_id_users_id_fk";
  
  DROP INDEX "hospital_info_updated_by_idx";
  DROP INDEX "_hospital_info_v_version_version_updated_by_idx";
  DROP INDEX "departments_updated_by_idx";
  DROP INDEX "_departments_v_version_version_updated_by_idx";
  DROP INDEX "doctors_updated_by_idx";
  DROP INDEX "_doctors_v_version_version_updated_by_idx";
  DROP INDEX "testimonials_updated_by_idx";
  DROP INDEX "_testimonials_v_version_version_updated_by_idx";
  DROP INDEX "videos_updated_by_idx";
  DROP INDEX "_videos_v_version_version_updated_by_idx";
  DROP INDEX "faqs_updated_by_idx";
  DROP INDEX "_faqs_v_version_version_updated_by_idx";
  DROP INDEX "insurers_updated_by_idx";
  DROP INDEX "_insurers_v_version_version_updated_by_idx";
  DROP INDEX "tpas_updated_by_idx";
  DROP INDEX "_tpas_v_version_version_updated_by_idx";
  DROP INDEX "schemes_updated_by_idx";
  DROP INDEX "_schemes_v_version_version_updated_by_idx";
  ALTER TABLE "hospital_info" DROP COLUMN "updated_by_id";
  ALTER TABLE "_hospital_info_v" DROP COLUMN "version_updated_by_id";
  ALTER TABLE "departments" DROP COLUMN "updated_by_id";
  ALTER TABLE "_departments_v" DROP COLUMN "version_updated_by_id";
  ALTER TABLE "doctors" DROP COLUMN "updated_by_id";
  ALTER TABLE "_doctors_v" DROP COLUMN "version_updated_by_id";
  ALTER TABLE "testimonials" DROP COLUMN "updated_by_id";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_updated_by_id";
  ALTER TABLE "videos" DROP COLUMN "updated_by_id";
  ALTER TABLE "_videos_v" DROP COLUMN "version_updated_by_id";
  ALTER TABLE "faqs" DROP COLUMN "updated_by_id";
  ALTER TABLE "_faqs_v" DROP COLUMN "version_updated_by_id";
  ALTER TABLE "insurers" DROP COLUMN "updated_by_id";
  ALTER TABLE "_insurers_v" DROP COLUMN "version_updated_by_id";
  ALTER TABLE "tpas" DROP COLUMN "updated_by_id";
  ALTER TABLE "_tpas_v" DROP COLUMN "version_updated_by_id";
  ALTER TABLE "schemes" DROP COLUMN "updated_by_id";
  ALTER TABLE "_schemes_v" DROP COLUMN "version_updated_by_id";`)
}
