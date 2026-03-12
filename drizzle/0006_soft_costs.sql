CREATE TABLE IF NOT EXISTS "soft_costs" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "category" text NOT NULL,
  "description" text NOT NULL,
  "vendor" text,
  "amount" integer NOT NULL,
  "paid_at" timestamp,
  "is_paid" boolean DEFAULT false,
  "notes" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "soft_costs_project_idx" ON "soft_costs"("project_id");
