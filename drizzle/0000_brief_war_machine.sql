CREATE TABLE "custom_content_blocks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"content" text NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"cta_label" varchar(120) DEFAULT '' NOT NULL,
	"cta_url" varchar(500) DEFAULT '' NOT NULL,
	"sort_order" serial NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_configurations" (
	"id" integer PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"settings" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_configurations_single_row" CHECK ("event_configurations"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"guest_number" serial NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"normalized_name" varchar(160) NOT NULL,
	"attending_peatonal" boolean,
	"attending_key" varchar(12),
	"has_plus_one" boolean DEFAULT false NOT NULL,
	"plus_one_name" varchar(160) DEFAULT '' NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guests_guest_number_unique" UNIQUE("guest_number")
);
--> statement-breakpoint
CREATE TABLE "image_slots" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"caption" varchar(300) DEFAULT '' NOT NULL,
	"src" varchar(300) NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"aspect_ratio" varchar(16) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "guests_normalized_name_idx" ON "guests" USING btree ("normalized_name");