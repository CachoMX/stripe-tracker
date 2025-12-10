-- Add transaction limits to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS transaction_limit INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS transactions_used INTEGER DEFAULT 0;

-- Set limits based on subscription plan
UPDATE tenants
SET transaction_limit = CASE
  WHEN subscription_plan = 'basic' THEN 1000
  WHEN subscription_plan = 'pro' THEN 10000
  WHEN subscription_plan = 'enterprise' THEN -1  -- unlimited
  ELSE 1000
END
WHERE transaction_limit IS NULL;

-- Create function to check transaction limits
CREATE OR REPLACE FUNCTION check_transaction_limit()
RETURNS TRIGGER AS $$
DECLARE
  tenant_limit INTEGER;
  tenant_used INTEGER;
BEGIN
  -- Get tenant's transaction limit and usage
  SELECT transaction_limit, transactions_used
  INTO tenant_limit, tenant_used
  FROM tenants
  WHERE id = NEW.tenant_id;

  -- If unlimited (-1), allow
  IF tenant_limit = -1 THEN
    RETURN NEW;
  END IF;

  -- Check if limit exceeded
  IF tenant_used >= tenant_limit THEN
    RAISE EXCEPTION 'Transaction limit exceeded. Current usage: %, Limit: %', tenant_used, tenant_limit
      USING ERRCODE = '23514';  -- check_violation
  END IF;

  -- Increment usage counter
  UPDATE tenants
  SET transactions_used = transactions_used + 1
  WHERE id = NEW.tenant_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce transaction limits
DROP TRIGGER IF EXISTS enforce_transaction_limit ON transactions;
CREATE TRIGGER enforce_transaction_limit
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION check_transaction_limit();

-- Create function to reset monthly transaction counters
CREATE OR REPLACE FUNCTION reset_monthly_transaction_counters()
RETURNS void AS $$
BEGIN
  UPDATE tenants
  SET transactions_used = 0
  WHERE subscription_status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Add index for faster limit checks
CREATE INDEX IF NOT EXISTS idx_tenants_transaction_usage
  ON tenants(transaction_limit, transactions_used);

-- Create view for tenant usage statistics
CREATE OR REPLACE VIEW tenant_usage_stats AS
SELECT
  t.id,
  t.clerk_user_id,
  t.subscription_plan,
  t.subscription_status,
  t.transaction_limit,
  t.transactions_used,
  CASE
    WHEN t.transaction_limit = -1 THEN 0
    ELSE ROUND((t.transactions_used::DECIMAL / NULLIF(t.transaction_limit, 0)) * 100, 2)
  END as usage_percentage,
  t.transaction_limit - t.transactions_used as remaining_transactions,
  COUNT(tr.id) as total_transactions_all_time
FROM tenants t
LEFT JOIN transactions tr ON t.id = tr.tenant_id
GROUP BY t.id, t.clerk_user_id, t.subscription_plan, t.subscription_status,
         t.transaction_limit, t.transactions_used;

-- Grant access to view
GRANT SELECT ON tenant_usage_stats TO authenticated;
