-- ── Stripe webhook idempotency ───────────────────────────────────────────────
-- Prevents duplicate processing when Stripe retries a webhook event.
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  id          TEXT        PRIMARY KEY,   -- Stripe event ID (evt_...)
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-clean events older than 30 days (Stripe retries within 72h max)
CREATE OR REPLACE FUNCTION prune_processed_stripe_events() RETURNS void
LANGUAGE sql AS $$
  DELETE FROM processed_stripe_events WHERE processed_at < NOW() - INTERVAL '30 days';
$$;

-- ── Performance indices ───────────────────────────────────────────────────────
-- Stripe webhook: lookup by stripe_customer_id is on the hot path
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Content history: user's content list ordered by date
CREATE INDEX IF NOT EXISTS idx_content_user_id_created_at
  ON content (user_id, created_at DESC);

-- Admin stats: cumulative user growth chart
CREATE INDEX IF NOT EXISTS idx_users_created_at
  ON users (created_at DESC);

-- Admin stats: content growth chart
CREATE INDEX IF NOT EXISTS idx_content_created_at
  ON content (created_at DESC);

-- Cancel surveys cross-reference
CREATE INDEX IF NOT EXISTS idx_cancel_surveys_user_id
  ON cancel_surveys (user_id);
