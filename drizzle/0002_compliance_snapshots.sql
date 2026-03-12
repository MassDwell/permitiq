CREATE TABLE IF NOT EXISTS "compliance_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "health_score" integer NOT NULL,
  "total_items" integer NOT NULL,
  "met_items" integer NOT NULL,
  "snapshot_date" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "compliance_snapshots" ADD CONSTRAINT "compliance_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "compliance_snapshots" ADD CONSTRAINT "compliance_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
