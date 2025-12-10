-- Row Level Security (RLS) Policies for Multi-Tenant Security
-- This ensures users can only access their own data

-- 0. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can update own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can view own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can insert own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can update own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can delete own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own checkout sessions" ON checkout_sessions;
DROP POLICY IF EXISTS "Users can insert own checkout sessions" ON checkout_sessions;
DROP POLICY IF EXISTS "Users can update own checkout sessions" ON checkout_sessions;
DROP POLICY IF EXISTS "Users can delete own checkout sessions" ON checkout_sessions;

-- 1. Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Users can only see their own tenant
-- Note: auth_user_id matches Supabase auth.uid()
CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  USING (auth_user_id = auth.uid()::text);

CREATE POLICY "Users can update own tenant"
  ON tenants FOR UPDATE
  USING (auth_user_id = auth.uid()::text);

-- 3. Policy: Users can only see their own payment links
CREATE POLICY "Users can view own payment links"
  ON payment_links FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE auth_user_id = auth.uid()::text
  ));

CREATE POLICY "Users can insert own payment links"
  ON payment_links FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT id FROM tenants WHERE auth_user_id = auth.uid()::text
  ));

CREATE POLICY "Users can update own payment links"
  ON payment_links FOR UPDATE
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE auth_user_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete own payment links"
  ON payment_links FOR DELETE
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE auth_user_id = auth.uid()::text
  ));

-- 4. Policy: Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE auth_user_id = auth.uid()::text
  ));

-- Note: Transactions are INSERT only (created by webhooks/system)
-- Users should not be able to UPDATE or DELETE transactions directly

-- 5. Policy: Users can only see their own checkout sessions
CREATE POLICY "Users can view own checkout sessions"
  ON checkout_sessions FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE auth_user_id = auth.uid()::text
  ));

CREATE POLICY "Users can insert own checkout sessions"
  ON checkout_sessions FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT id FROM tenants WHERE auth_user_id = auth.uid()::text
  ));

CREATE POLICY "Users can update own checkout sessions"
  ON checkout_sessions FOR UPDATE
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE auth_user_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete own checkout sessions"
  ON checkout_sessions FOR DELETE
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE auth_user_id = auth.uid()::text
  ));

-- 6. Service role bypass (for webhooks and admin operations)
-- The service role key automatically bypasses RLS, so no special policy needed

-- 7. Create indexes for performance on RLS checks
CREATE INDEX IF NOT EXISTS idx_tenants_auth_user_id ON tenants(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_tenant_id ON payment_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_tenant_id ON checkout_sessions(tenant_id);
