-- Token usage logging for Anthropic cost tracking
CREATE TABLE IF NOT EXISTS token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  model text NOT NULL,
  input_tokens int NOT NULL,
  output_tokens int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS token_usage_created_at_idx ON token_usage (created_at);

-- Cost alert deduplication log (prevents spam — one alert per day)
CREATE TABLE IF NOT EXISTS cost_alerts_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  threshold_usd numeric NOT NULL,
  daily_cost_usd numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS: only service role can read/write (no user access)
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_alerts_log ENABLE ROW LEVEL SECURITY;
