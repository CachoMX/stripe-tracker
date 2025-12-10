-- Webhook Idempotency Table
-- Prevents duplicate processing of Stripe webhook events

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payload JSONB,
  UNIQUE(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);

-- Auto-cleanup old webhook events (older than 30 days)
-- This prevents the table from growing indefinitely
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_events
  WHERE processed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a cron job to run cleanup weekly
-- Uncomment if you want automatic cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-webhooks', '0 0 * * 0', 'SELECT cleanup_old_webhook_events()');

-- Failed Webhooks Table for Retry Logic
CREATE TABLE IF NOT EXISTS failed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_retry_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for retry queries
CREATE INDEX IF NOT EXISTS idx_failed_webhooks_retry_count ON failed_webhooks(retry_count);
CREATE INDEX IF NOT EXISTS idx_failed_webhooks_created_at ON failed_webhooks(created_at);
