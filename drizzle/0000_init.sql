CREATE TABLE "lookup_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lookup_version_id" uuid NOT NULL,
	"parent" varchar(255) NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"input_type" varchar(255) NOT NULL,
	"description" text,
	"comment_1" text,
	"comment_2" text,
	"extra_info" jsonb,
	"is_disabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lookup_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_type_id" uuid NOT NULL,
	"version_name" varchar(10) NOT NULL,
	"uploaded_by_user_id" uuid NOT NULL,
	"remarks" text,
	"file_name" varchar(255),
	"file_location" varchar(800),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_version" varchar(255) NOT NULL,
	"item_number" varchar(255) NOT NULL,
	"item_number_version" varchar(255) NOT NULL,
	"order_name" varchar(255) NOT NULL,
	"product_type_id" uuid NOT NULL,
	"lookup_version_id" uuid NOT NULL,
	"encoded_order_data" jsonb NOT NULL,
	"decoded_order_data" jsonb NOT NULL,
	"pax_major" varchar(255) NOT NULL,
	"pax_minor" varchar(255) NOT NULL,
	"pipeline_status" varchar(255) NOT NULL,
	"pipeline_status_url" varchar(1000) NOT NULL,
	"product_no" integer,
	"unit_id" integer,
	"data_server_area" varchar(255),
	"alarm_server_area" varchar(255),
	"process_area" varchar(255),
	"changed_order_data" jsonb NOT NULL,
	"remarks" text,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"product_type_code" varchar(255) NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"azure_user_id" varchar(800) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lookup_entries" ADD CONSTRAINT "lookup_entries_lookup_version_id_lookup_versions_id_fk" FOREIGN KEY ("lookup_version_id") REFERENCES "public"."lookup_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_versions" ADD CONSTRAINT "lookup_versions_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_versions" ADD CONSTRAINT "lookup_versions_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_histories" ADD CONSTRAINT "order_histories_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_histories" ADD CONSTRAINT "order_histories_lookup_version_id_lookup_versions_id_fk" FOREIGN KEY ("lookup_version_id") REFERENCES "public"."lookup_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_histories" ADD CONSTRAINT "order_histories_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_types" ADD CONSTRAINT "product_types_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lookup_entries_lookup_version_id_identifier_unique" ON "lookup_entries" USING btree ("lookup_version_id","identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "lookup_versions_product_type_id_version_name_unique" ON "lookup_versions" USING btree ("product_type_id","version_name");--> statement-breakpoint
CREATE UNIQUE INDEX "order_histories_item_number_submission_version_unique" ON "order_histories" USING btree ("item_number","item_number_version","submission_version");