-- Migration: Add referral system columns to users table
-- CLA-96: Referral System

ALTER TABLE "users" ADD COLUMN "referral_code" text UNIQUE;
ALTER TABLE "users" ADD COLUMN "referred_by" uuid REFERENCES "users"("id") ON DELETE SET NULL;
