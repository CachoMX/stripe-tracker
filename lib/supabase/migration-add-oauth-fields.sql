-- Add Stripe Connect OAuth fields to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_refresh_token TEXT;

-- Add index for stripe_account_id lookups
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_account_id ON tenants(stripe_account_id);

-- Comment on columns
COMMENT ON COLUMN tenants.stripe_account_id IS 'Stripe Connect account ID (stripe_user_id from OAuth)';
COMMENT ON COLUMN tenants.stripe_secret_key IS 'OAuth access token or manual secret key';
COMMENT ON COLUMN tenants.stripe_refresh_token IS 'OAuth refresh token for renewing access';
