CREATE TABLE IF NOT EXISTS "project_shares" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "share_token" text NOT NULL UNIQUE,
  "created_by" text NOT NULL,
  "label" text,
  "expires_at" timestamp,
  "view_count" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "project_shares_token_idx" ON "project_shares"("share_token");
CREATE INDEX IF NOT EXISTS "project_shares_project_idx" ON "project_shares"("project_id");
