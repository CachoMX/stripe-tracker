-- Drop the old checkout_sessions table and recreate with correct columns
DROP TABLE IF EXISTS checkout_sessions CASCADE;

-- Recreate checkout sessions table with correct structure
CREATE TABLE checkout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Session Info
  name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate index
CREATE INDEX idx_checkout_sessions_tenant_id ON checkout_sessions(tenant_id);

-- Add RLS
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON checkout_sessions
  FOR SELECT USING (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

CREATE POLICY "Users can insert own sessions" ON checkout_sessions
  FOR INSERT WITH CHECK (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

CREATE POLICY "Users can update own sessions" ON checkout_sessions
  FOR UPDATE USING (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

-- Add trigger for updated_at
CREATE TRIGGER update_checkout_sessions_updated_at BEFORE UPDATE ON checkout_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
