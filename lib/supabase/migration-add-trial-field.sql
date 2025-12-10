-- Add trial_ends_at field to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Add index for trial lookups
CREATE INDEX IF NOT EXISTS idx_tenants_trial_ends_at ON tenants(trial_ends_at);

-- Add comment
COMMENT ON COLUMN tenants.trial_ends_at IS 'When the free trial ends. NULL means paid subscription or no trial.';
