CREATE TABLE IF NOT EXISTS "project_members" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" text,
  "email" text NOT NULL,
  "role" text NOT NULL DEFAULT 'viewer',
  "invite_status" text NOT NULL DEFAULT 'pending',
  "invite_token" text UNIQUE,
  "invited_by" text NOT NULL,
  "invited_at" timestamp DEFAULT now(),
  "accepted_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "project_members_project_idx" ON "project_members"("project_id");
CREATE INDEX IF NOT EXISTS "project_members_email_idx" ON "project_members"("email");
CREATE INDEX IF NOT EXISTS "project_members_token_idx" ON "project_members"("invite_token");
