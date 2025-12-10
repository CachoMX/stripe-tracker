import { supabaseAdmin } from './supabase/admin';

export async function getOrCreateTenant(userId: string, email: string | undefined) {
  // Try to get existing tenant
  const { data: existingTenant } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (existingTenant) {
    return existingTenant;
  }

  // Create new tenant with 14-day trial
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const { data: newTenant, error } = await supabaseAdmin
    .from('tenants')
    .insert({
      clerk_user_id: userId,
      email,
      trial_ends_at: trialEndsAt.toISOString(),
      subscription_status: 'trialing',
    })
    .select()
    .single();

  if (error) throw error;
  return newTenant;
}

export function isTrialActive(tenant: any): boolean {
  if (!tenant.trial_ends_at) return false;
  return new Date(tenant.trial_ends_at) > new Date();
}

export function isSubscriptionActive(tenant: any): boolean {
  return tenant.subscription_status === 'active';
}

export function hasAccess(tenant: any): boolean {
  // Has access if:
  // 1. Active paid subscription, OR
  // 2. Active trial
  return isSubscriptionActive(tenant) || isTrialActive(tenant);
}

export function getDaysLeftInTrial(tenant: any): number {
  if (!tenant.trial_ends_at) return 0;
  const now = new Date();
  const trialEnd = new Date(tenant.trial_ends_at);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
