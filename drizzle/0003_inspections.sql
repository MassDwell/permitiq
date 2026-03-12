CREATE TABLE IF NOT EXISTS "inspections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "inspection_type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'scheduled',
  "scheduled_date" date,
  "completed_date" date,
  "inspector_name" text,
  "notes" text,
  "failure_reason" text,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
