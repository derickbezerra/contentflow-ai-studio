-- Asaas payment integration columns
-- Run this migration to replace Stripe fields with Asaas equivalents

-- Add Asaas customer and subscription IDs to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT;

-- Index for fast webhook lookups by asaas_customer_id
CREATE INDEX IF NOT EXISTS users_asaas_customer_id_idx ON users (asaas_customer_id);

-- Idempotency table for Asaas webhooks (prevents duplicate processing)
CREATE TABLE IF NOT EXISTS processed_asaas_events (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-cleanup events older than 30 days (optional, keeps table lean)
-- Can be run via pg_cron if needed:
-- DELETE FROM processed_asaas_events WHERE created_at < NOW() - INTERVAL '30 days';
