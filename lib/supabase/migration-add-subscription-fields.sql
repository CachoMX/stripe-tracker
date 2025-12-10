-- Add subscription management fields to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS transaction_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS transaction_limit INTEGER DEFAULT 500;

-- Add indexes for subscription lookups
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id ON tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_subscription_id ON tenants(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);

-- Add comments
COMMENT ON COLUMN tenants.stripe_customer_id IS 'Stripe Customer ID for subscription billing';
COMMENT ON COLUMN tenants.stripe_subscription_id IS 'Active Stripe Subscription ID';
COMMENT ON COLUMN tenants.subscription_plan IS 'Current plan: starter, pro, business';
COMMENT ON COLUMN tenants.subscription_status IS 'Subscription status: active, canceled, past_due, trialing';
COMMENT ON COLUMN tenants.subscription_period_start IS 'Current billing period start';
COMMENT ON COLUMN tenants.subscription_period_end IS 'Current billing period end';
COMMENT ON COLUMN tenants.transaction_count IS 'Transaction count for current period';
COMMENT ON COLUMN tenants.transaction_limit IS 'Transaction limit based on plan';
