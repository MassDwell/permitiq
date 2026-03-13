CREATE TABLE "jurisdiction_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction_code" text NOT NULL,
	"jurisdiction_name" text NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"last_requested_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "jurisdiction_rules" ADD COLUMN "source" text DEFAULT 'curated';--> statement-breakpoint
ALTER TABLE "jurisdiction_rules" ADD COLUMN "cached_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "gross_floor_area" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "article_eighty_track" text;