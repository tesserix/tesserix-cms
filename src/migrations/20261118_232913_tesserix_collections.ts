import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_features_icon" AS ENUM('BarChart', 'Building2', 'CalendarDays', 'Camera', 'ChefHat', 'CreditCard', 'FileText', 'FlaskConical', 'History', 'Hospital', 'KeyRound', 'Languages', 'MapPin', 'MessageSquare', 'Mic', 'Package', 'Palette', 'Pencil', 'Pill', 'Plane', 'Salad', 'ScanLine', 'Shield', 'ShieldCheck', 'ShoppingBag', 'Truck', 'UserCheck', 'Users', 'Utensils', 'Wallet', 'Wrench');
  CREATE TYPE "public"."enum_products_listings_platform" AS ENUM('ios', 'android');
  CREATE TYPE "public"."enum_products_icon" AS ENUM('BarChart', 'Building2', 'CalendarDays', 'Camera', 'ChefHat', 'CreditCard', 'FileText', 'FlaskConical', 'History', 'Hospital', 'KeyRound', 'Languages', 'MapPin', 'MessageSquare', 'Mic', 'Package', 'Palette', 'Pencil', 'Pill', 'Plane', 'Salad', 'ScanLine', 'Shield', 'ShieldCheck', 'ShoppingBag', 'Truck', 'UserCheck', 'Users', 'Utensils', 'Wallet', 'Wrench');
  CREATE TYPE "public"."enum_products_launch_status" AS ENUM('available', 'coming-soon');
  CREATE TYPE "public"."enum_products_industry" AS ENUM('commerce', 'food', 'rentals', 'healthcare', 'nutrition', 'travel');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_features_icon" AS ENUM('BarChart', 'Building2', 'CalendarDays', 'Camera', 'ChefHat', 'CreditCard', 'FileText', 'FlaskConical', 'History', 'Hospital', 'KeyRound', 'Languages', 'MapPin', 'MessageSquare', 'Mic', 'Package', 'Palette', 'Pencil', 'Pill', 'Plane', 'Salad', 'ScanLine', 'Shield', 'ShieldCheck', 'ShoppingBag', 'Truck', 'UserCheck', 'Users', 'Utensils', 'Wallet', 'Wrench');
  CREATE TYPE "public"."enum__products_v_version_listings_platform" AS ENUM('ios', 'android');
  CREATE TYPE "public"."enum__products_v_version_icon" AS ENUM('BarChart', 'Building2', 'CalendarDays', 'Camera', 'ChefHat', 'CreditCard', 'FileText', 'FlaskConical', 'History', 'Hospital', 'KeyRound', 'Languages', 'MapPin', 'MessageSquare', 'Mic', 'Package', 'Palette', 'Pencil', 'Pill', 'Plane', 'Salad', 'ScanLine', 'Shield', 'ShieldCheck', 'ShoppingBag', 'Truck', 'UserCheck', 'Users', 'Utensils', 'Wallet', 'Wrench');
  CREATE TYPE "public"."enum__products_v_version_industry" AS ENUM('commerce', 'food', 'rentals', 'healthcare', 'nutrition', 'travel');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_team_members_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_principles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__principles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_beliefs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__beliefs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_open_source_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__open_source_projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "products_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_products_features_icon" DEFAULT 'Package',
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "products_listings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_products_listings_platform",
  	"url" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"slug" varchar,
  	"has_been_published" boolean DEFAULT false,
  	"tagline" varchar,
  	"description" varchar,
  	"long_description" varchar,
  	"icon" "enum_products_icon" DEFAULT 'Package',
  	"status" "enum_products_launch_status" DEFAULT 'coming-soon',
  	"industry" "enum_products_industry",
  	"eta" varchar,
  	"website" varchar,
  	"pricing_url" varchar,
  	"cta_label" varchar,
  	"cta_subtext" varchar,
  	"trial_line" varchar,
  	"operating_system" varchar,
  	"vendor_listing_url" varchar,
  	"site_image_id" integer,
  	"order" numeric,
  	"review_note" varchar,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_products_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__products_v_version_features_icon" DEFAULT 'Package',
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_listings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__products_v_version_listings_platform",
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_has_been_published" boolean DEFAULT false,
  	"version_tagline" varchar,
  	"version_description" varchar,
  	"version_long_description" varchar,
  	"version_icon" "enum__products_v_version_icon" DEFAULT 'Package',
  	"version_status" "enum_products_launch_status" DEFAULT 'coming-soon',
  	"version_industry" "enum__products_v_version_industry",
  	"version_eta" varchar,
  	"version_website" varchar,
  	"version_pricing_url" varchar,
  	"version_cta_label" varchar,
  	"version_cta_subtext" varchar,
  	"version_trial_line" varchar,
  	"version_operating_system" varchar,
  	"version_vendor_listing_url" varchar,
  	"version_site_image_id" integer,
  	"version_order" numeric,
  	"version_review_note" varchar,
  	"version_updated_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar,
  	"slug" varchar,
  	"has_been_published" boolean DEFAULT false,
  	"title" varchar,
  	"bio" varchar,
  	"linked_in" varchar,
  	"github" varchar,
  	"photo_id" integer,
  	"order" numeric,
  	"review_note" varchar,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_members_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "team_members_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_team_members_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_has_been_published" boolean DEFAULT false,
  	"version_title" varchar,
  	"version_bio" varchar,
  	"version_linked_in" varchar,
  	"version_github" varchar,
  	"version_photo_id" integer,
  	"version_order" numeric,
  	"version_review_note" varchar,
  	"version_updated_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_members_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_team_members_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "principles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"body" varchar,
  	"order" numeric,
  	"review_note" varchar,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_principles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_principles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_body" varchar,
  	"version_order" numeric,
  	"version_review_note" varchar,
  	"version_updated_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__principles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "beliefs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar,
  	"order" numeric,
  	"review_note" varchar,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_beliefs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_beliefs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_label" varchar,
  	"version_title" varchar,
  	"version_body" varchar,
  	"version_order" numeric,
  	"version_review_note" varchar,
  	"version_updated_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__beliefs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "open_source_projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar,
  	"description" varchar,
  	"order" numeric,
  	"review_note" varchar,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_open_source_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_open_source_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_order" numeric,
  	"version_review_note" varchar,
  	"version_updated_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__open_source_projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_members_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "principles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "beliefs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "open_source_projects_id" integer;
  ALTER TABLE "products_features" ADD CONSTRAINT "products_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_listings" ADD CONSTRAINT "products_listings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_site_image_id_media_id_fk" FOREIGN KEY ("site_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_features" ADD CONSTRAINT "_products_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_listings" ADD CONSTRAINT "_products_v_version_listings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_site_image_id_media_id_fk" FOREIGN KEY ("version_site_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_texts" ADD CONSTRAINT "_products_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members_texts" ADD CONSTRAINT "team_members_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_parent_id_team_members_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v_texts" ADD CONSTRAINT "_team_members_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "principles" ADD CONSTRAINT "principles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "principles" ADD CONSTRAINT "principles_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_principles_v" ADD CONSTRAINT "_principles_v_parent_id_principles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."principles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_principles_v" ADD CONSTRAINT "_principles_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_principles_v" ADD CONSTRAINT "_principles_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "beliefs" ADD CONSTRAINT "beliefs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "beliefs" ADD CONSTRAINT "beliefs_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_beliefs_v" ADD CONSTRAINT "_beliefs_v_parent_id_beliefs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."beliefs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_beliefs_v" ADD CONSTRAINT "_beliefs_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_beliefs_v" ADD CONSTRAINT "_beliefs_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "open_source_projects" ADD CONSTRAINT "open_source_projects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "open_source_projects" ADD CONSTRAINT "open_source_projects_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_open_source_projects_v" ADD CONSTRAINT "_open_source_projects_v_parent_id_open_source_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."open_source_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_open_source_projects_v" ADD CONSTRAINT "_open_source_projects_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_open_source_projects_v" ADD CONSTRAINT "_open_source_projects_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_features_order_idx" ON "products_features" USING btree ("_order");
  CREATE INDEX "products_features_parent_id_idx" ON "products_features" USING btree ("_parent_id");
  CREATE INDEX "products_listings_order_idx" ON "products_listings" USING btree ("_order");
  CREATE INDEX "products_listings_parent_id_idx" ON "products_listings" USING btree ("_parent_id");
  CREATE INDEX "products_tenant_idx" ON "products" USING btree ("tenant_id");
  CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_site_image_idx" ON "products" USING btree ("site_image_id");
  CREATE INDEX "products_updated_by_idx" ON "products" USING btree ("updated_by_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_2_idx" ON "products" USING btree ("tenant_id","slug");
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "_products_v_version_features_order_idx" ON "_products_v_version_features" USING btree ("_order");
  CREATE INDEX "_products_v_version_features_parent_id_idx" ON "_products_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_listings_order_idx" ON "_products_v_version_listings" USING btree ("_order");
  CREATE INDEX "_products_v_version_listings_parent_id_idx" ON "_products_v_version_listings" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_tenant_idx" ON "_products_v" USING btree ("version_tenant_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_site_image_idx" ON "_products_v" USING btree ("version_site_image_id");
  CREATE INDEX "_products_v_version_version_updated_by_idx" ON "_products_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_slug_2_idx" ON "_products_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "_products_v_texts_order_parent" ON "_products_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "team_members_tenant_idx" ON "team_members" USING btree ("tenant_id");
  CREATE INDEX "team_members_slug_idx" ON "team_members" USING btree ("slug");
  CREATE INDEX "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX "team_members_updated_by_idx" ON "team_members" USING btree ("updated_by_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "team_members__status_idx" ON "team_members" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_3_idx" ON "team_members" USING btree ("tenant_id","slug");
  CREATE INDEX "team_members_texts_order_parent" ON "team_members_texts" USING btree ("order","parent_id");
  CREATE INDEX "_team_members_v_parent_idx" ON "_team_members_v" USING btree ("parent_id");
  CREATE INDEX "_team_members_v_version_version_tenant_idx" ON "_team_members_v" USING btree ("version_tenant_id");
  CREATE INDEX "_team_members_v_version_version_slug_idx" ON "_team_members_v" USING btree ("version_slug");
  CREATE INDEX "_team_members_v_version_version_photo_idx" ON "_team_members_v" USING btree ("version_photo_id");
  CREATE INDEX "_team_members_v_version_version_updated_by_idx" ON "_team_members_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_team_members_v_version_version_updated_at_idx" ON "_team_members_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_members_v_version_version_created_at_idx" ON "_team_members_v" USING btree ("version_created_at");
  CREATE INDEX "_team_members_v_version_version__status_idx" ON "_team_members_v" USING btree ("version__status");
  CREATE INDEX "_team_members_v_created_at_idx" ON "_team_members_v" USING btree ("created_at");
  CREATE INDEX "_team_members_v_updated_at_idx" ON "_team_members_v" USING btree ("updated_at");
  CREATE INDEX "_team_members_v_latest_idx" ON "_team_members_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_slug_3_idx" ON "_team_members_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "_team_members_v_texts_order_parent" ON "_team_members_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "principles_tenant_idx" ON "principles" USING btree ("tenant_id");
  CREATE INDEX "principles_updated_by_idx" ON "principles" USING btree ("updated_by_id");
  CREATE INDEX "principles_updated_at_idx" ON "principles" USING btree ("updated_at");
  CREATE INDEX "principles_created_at_idx" ON "principles" USING btree ("created_at");
  CREATE INDEX "principles__status_idx" ON "principles" USING btree ("_status");
  CREATE INDEX "_principles_v_parent_idx" ON "_principles_v" USING btree ("parent_id");
  CREATE INDEX "_principles_v_version_version_tenant_idx" ON "_principles_v" USING btree ("version_tenant_id");
  CREATE INDEX "_principles_v_version_version_updated_by_idx" ON "_principles_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_principles_v_version_version_updated_at_idx" ON "_principles_v" USING btree ("version_updated_at");
  CREATE INDEX "_principles_v_version_version_created_at_idx" ON "_principles_v" USING btree ("version_created_at");
  CREATE INDEX "_principles_v_version_version__status_idx" ON "_principles_v" USING btree ("version__status");
  CREATE INDEX "_principles_v_created_at_idx" ON "_principles_v" USING btree ("created_at");
  CREATE INDEX "_principles_v_updated_at_idx" ON "_principles_v" USING btree ("updated_at");
  CREATE INDEX "_principles_v_latest_idx" ON "_principles_v" USING btree ("latest");
  CREATE INDEX "beliefs_tenant_idx" ON "beliefs" USING btree ("tenant_id");
  CREATE INDEX "beliefs_updated_by_idx" ON "beliefs" USING btree ("updated_by_id");
  CREATE INDEX "beliefs_updated_at_idx" ON "beliefs" USING btree ("updated_at");
  CREATE INDEX "beliefs_created_at_idx" ON "beliefs" USING btree ("created_at");
  CREATE INDEX "beliefs__status_idx" ON "beliefs" USING btree ("_status");
  CREATE INDEX "_beliefs_v_parent_idx" ON "_beliefs_v" USING btree ("parent_id");
  CREATE INDEX "_beliefs_v_version_version_tenant_idx" ON "_beliefs_v" USING btree ("version_tenant_id");
  CREATE INDEX "_beliefs_v_version_version_updated_by_idx" ON "_beliefs_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_beliefs_v_version_version_updated_at_idx" ON "_beliefs_v" USING btree ("version_updated_at");
  CREATE INDEX "_beliefs_v_version_version_created_at_idx" ON "_beliefs_v" USING btree ("version_created_at");
  CREATE INDEX "_beliefs_v_version_version__status_idx" ON "_beliefs_v" USING btree ("version__status");
  CREATE INDEX "_beliefs_v_created_at_idx" ON "_beliefs_v" USING btree ("created_at");
  CREATE INDEX "_beliefs_v_updated_at_idx" ON "_beliefs_v" USING btree ("updated_at");
  CREATE INDEX "_beliefs_v_latest_idx" ON "_beliefs_v" USING btree ("latest");
  CREATE INDEX "open_source_projects_tenant_idx" ON "open_source_projects" USING btree ("tenant_id");
  CREATE INDEX "open_source_projects_updated_by_idx" ON "open_source_projects" USING btree ("updated_by_id");
  CREATE INDEX "open_source_projects_updated_at_idx" ON "open_source_projects" USING btree ("updated_at");
  CREATE INDEX "open_source_projects_created_at_idx" ON "open_source_projects" USING btree ("created_at");
  CREATE INDEX "open_source_projects__status_idx" ON "open_source_projects" USING btree ("_status");
  CREATE INDEX "_open_source_projects_v_parent_idx" ON "_open_source_projects_v" USING btree ("parent_id");
  CREATE INDEX "_open_source_projects_v_version_version_tenant_idx" ON "_open_source_projects_v" USING btree ("version_tenant_id");
  CREATE INDEX "_open_source_projects_v_version_version_updated_by_idx" ON "_open_source_projects_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_open_source_projects_v_version_version_updated_at_idx" ON "_open_source_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_open_source_projects_v_version_version_created_at_idx" ON "_open_source_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_open_source_projects_v_version_version__status_idx" ON "_open_source_projects_v" USING btree ("version__status");
  CREATE INDEX "_open_source_projects_v_created_at_idx" ON "_open_source_projects_v" USING btree ("created_at");
  CREATE INDEX "_open_source_projects_v_updated_at_idx" ON "_open_source_projects_v" USING btree ("updated_at");
  CREATE INDEX "_open_source_projects_v_latest_idx" ON "_open_source_projects_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_principles_fk" FOREIGN KEY ("principles_id") REFERENCES "public"."principles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_beliefs_fk" FOREIGN KEY ("beliefs_id") REFERENCES "public"."beliefs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_open_source_projects_fk" FOREIGN KEY ("open_source_projects_id") REFERENCES "public"."open_source_projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_principles_id_idx" ON "payload_locked_documents_rels" USING btree ("principles_id");
  CREATE INDEX "payload_locked_documents_rels_beliefs_id_idx" ON "payload_locked_documents_rels" USING btree ("beliefs_id");
  CREATE INDEX "payload_locked_documents_rels_open_source_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("open_source_projects_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_listings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_listings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_members_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_members_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_members_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "principles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_principles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "beliefs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_beliefs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "open_source_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_open_source_projects_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_features" CASCADE;
  DROP TABLE "products_listings" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_texts" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_features" CASCADE;
  DROP TABLE "_products_v_version_listings" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_texts" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "team_members_texts" CASCADE;
  DROP TABLE "_team_members_v" CASCADE;
  DROP TABLE "_team_members_v_texts" CASCADE;
  DROP TABLE "principles" CASCADE;
  DROP TABLE "_principles_v" CASCADE;
  DROP TABLE "beliefs" CASCADE;
  DROP TABLE "_beliefs_v" CASCADE;
  DROP TABLE "open_source_projects" CASCADE;
  DROP TABLE "_open_source_projects_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_members_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_principles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_beliefs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_open_source_projects_fk";
  
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_team_members_id_idx";
  DROP INDEX "payload_locked_documents_rels_principles_id_idx";
  DROP INDEX "payload_locked_documents_rels_beliefs_id_idx";
  DROP INDEX "payload_locked_documents_rels_open_source_projects_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_members_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "principles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "beliefs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "open_source_projects_id";
  DROP TYPE "public"."enum_products_features_icon";
  DROP TYPE "public"."enum_products_listings_platform";
  DROP TYPE "public"."enum_products_icon";
  DROP TYPE "public"."enum_products_launch_status";
  DROP TYPE "public"."enum_products_industry";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_features_icon";
  DROP TYPE "public"."enum__products_v_version_listings_platform";
  DROP TYPE "public"."enum__products_v_version_icon";
  DROP TYPE "public"."enum__products_v_version_industry";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_team_members_status";
  DROP TYPE "public"."enum__team_members_v_version_status";
  DROP TYPE "public"."enum_principles_status";
  DROP TYPE "public"."enum__principles_v_version_status";
  DROP TYPE "public"."enum_beliefs_status";
  DROP TYPE "public"."enum__beliefs_v_version_status";
  DROP TYPE "public"."enum_open_source_projects_status";
  DROP TYPE "public"."enum__open_source_projects_v_version_status";`)
}
