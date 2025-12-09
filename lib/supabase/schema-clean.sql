-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS checkout_sessions CASCADE;
DROP TABLE IF EXISTS payment_links CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,

  -- Stripe Configuration (encrypted in production)
  stripe_secret_key TEXT,
  stripe_publishable_key TEXT,

  -- Hyros Configuration
  hyros_tracking_script TEXT,

  -- Custom Domain
  custom_domain TEXT UNIQUE,
  domain_verified BOOLEAN DEFAULT FALSE,
  domain_verification_token TEXT,

  -- Subscription
  subscription_status TEXT DEFAULT 'trial',
  subscription_plan TEXT DEFAULT 'basic',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Links table
CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Link Info
  name TEXT NOT NULL,
  stripe_payment_link TEXT NOT NULL,

  -- Metadata
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkout Sessions table
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

-- Transactions table (for analytics)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Stripe Data
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,

  -- Customer Info
  customer_email TEXT NOT NULL,
  customer_name TEXT,

  -- Payment Info
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,

  -- Source
  payment_link_id UUID REFERENCES payment_links(id),

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tenants_clerk_user_id ON tenants(clerk_user_id);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain);
CREATE INDEX idx_payment_links_tenant_id ON payment_links(tenant_id);
CREATE INDEX idx_checkout_sessions_tenant_id ON checkout_sessions(tenant_id);
CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX idx_transactions_customer_email ON transactions(customer_email);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_links_updated_at BEFORE UPDATE ON payment_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkout_sessions_updated_at BEFORE UPDATE ON checkout_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - can be enhanced)
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT USING (clerk_user_id = auth.uid()::TEXT);

CREATE POLICY "Users can insert own tenant" ON tenants
  FOR INSERT WITH CHECK (clerk_user_id = auth.uid()::TEXT);

CREATE POLICY "Users can update own tenant" ON tenants
  FOR UPDATE USING (clerk_user_id = auth.uid()::TEXT);

CREATE POLICY "Users can view own payment links" ON payment_links
  FOR SELECT USING (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

CREATE POLICY "Users can insert own payment links" ON payment_links
  FOR INSERT WITH CHECK (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

CREATE POLICY "Users can update own payment links" ON payment_links
  FOR UPDATE USING (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

CREATE POLICY "Users can delete own payment links" ON payment_links
  FOR DELETE USING (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

CREATE POLICY "Users can view own sessions" ON checkout_sessions
  FOR SELECT USING (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

CREATE POLICY "Users can insert own sessions" ON checkout_sessions
  FOR INSERT WITH CHECK (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

CREATE POLICY "Users can update own sessions" ON checkout_sessions
  FOR UPDATE USING (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));

CREATE POLICY "Users can insert transactions" ON transactions
  FOR INSERT WITH CHECK (tenant_id IN (SELECT id FROM tenants WHERE clerk_user_id = auth.uid()::TEXT));
