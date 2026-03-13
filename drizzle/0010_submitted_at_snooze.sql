ALTER TABLE "compliance_items" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp;
ALTER TABLE "compliance_items" ADD COLUMN IF NOT EXISTS "follow_up_snoozed_until" timestamp;
