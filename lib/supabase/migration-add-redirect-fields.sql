-- Add redirect configuration fields to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS redirect_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS redirect_seconds INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS redirect_url TEXT;
