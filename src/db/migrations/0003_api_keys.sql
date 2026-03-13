-- Migration: API Keys table and related tables
-- CLA-98: API Keys (Public API foundation)
-- Note: These tables are already defined in the schema and applied via drizzle/0008_api_tables.sql

CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" text PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "key_prefix" text NOT NULL,
  "key_hash" text NOT NULL,
  "last_used_at" timestamp,
  "expires_at" timestamp,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "api_webhooks" (
  "id" text PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "events" jsonb NOT NULL,
  "secret" text NOT NULL,
  "is_active" boolean DEFAULT true,
  "last_triggered_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "api_request_logs" (
  "id" text PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "api_key_id" text REFERENCES "api_keys"("id") ON DELETE SET NULL,
  "method" text NOT NULL,
  "endpoint" text NOT NULL,
  "status_code" integer NOT NULL,
  "response_time_ms" integer,
  "requested_at" timestamp NOT NULL DEFAULT now()
);
