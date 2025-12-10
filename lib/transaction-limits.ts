import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export interface TenantUsage {
  transactionLimit: number;
  transactionsUsed: number;
  usagePercentage: number;
  remainingTransactions: number;
  isUnlimited: boolean;
}

/**
 * Check if tenant has reached their transaction limit
 */
export async function checkTransactionLimit(tenantId: string): Promise<{
  allowed: boolean;
  usage: TenantUsage;
  message?: string;
}> {
  try {
    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .select('transaction_limit, transactions_used, subscription_plan, subscription_status')
      .eq('id', tenantId)
      .single();

    if (error || !tenant) {
      logger.error('Failed to fetch tenant for limit check', { tenantId, error: error?.message });
      throw new Error('Tenant not found');
    }

    const isUnlimited = tenant.transaction_limit === -1;
    const usagePercentage = isUnlimited
      ? 0
      : Math.round((tenant.transactions_used / tenant.transaction_limit) * 100);
    const remainingTransactions = isUnlimited
      ? Infinity
      : tenant.transaction_limit - tenant.transactions_used;

    const usage: TenantUsage = {
      transactionLimit: tenant.transaction_limit,
      transactionsUsed: tenant.transactions_used,
      usagePercentage,
      remainingTransactions: remainingTransactions === Infinity ? -1 : remainingTransactions,
      isUnlimited,
    };

    // Check if subscription is inactive
    if (tenant.subscription_status !== 'active' && tenant.subscription_status !== 'trialing') {
      return {
        allowed: false,
        usage,
        message: `Subscription is ${tenant.subscription_status}. Please update your subscription to continue.`,
      };
    }

    // Check if limit exceeded
    if (!isUnlimited && tenant.transactions_used >= tenant.transaction_limit) {
      logger.warn('Transaction limit exceeded', {
        tenantId,
        limit: tenant.transaction_limit,
        used: tenant.transactions_used,
      });

      return {
        allowed: false,
        usage,
        message: `Transaction limit reached (${tenant.transactions_used}/${tenant.transaction_limit}). Please upgrade your plan.`,
      };
    }

    // Warn if approaching limit (90%)
    if (!isUnlimited && usagePercentage >= 90) {
      logger.warn('Transaction limit approaching', {
        tenantId,
        usagePercentage,
        remaining: remainingTransactions,
      });
    }

    return {
      allowed: true,
      usage,
    };
  } catch (error: any) {
    logger.error('Error checking transaction limit', { tenantId, error: error.message });
    throw error;
  }
}

/**
 * Get current usage stats for a tenant
 */
export async function getTenantUsage(tenantId: string): Promise<TenantUsage | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('tenant_usage_stats')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error || !data) {
      logger.error('Failed to fetch tenant usage', { tenantId, error: error?.message });
      return null;
    }

    return {
      transactionLimit: data.transaction_limit,
      transactionsUsed: data.transactions_used,
      usagePercentage: data.usage_percentage || 0,
      remainingTransactions: data.remaining_transactions,
      isUnlimited: data.transaction_limit === -1,
    };
  } catch (error: any) {
    logger.error('Error fetching tenant usage', { tenantId, error: error.message });
    return null;
  }
}

/**
 * Update tenant's transaction limit based on plan
 */
export async function updateTransactionLimit(
  tenantId: string,
  plan: 'basic' | 'pro' | 'enterprise'
): Promise<void> {
  const limits = {
    basic: 1000,
    pro: 10000,
    enterprise: -1, // unlimited
  };

  const newLimit = limits[plan];

  try {
    const { error } = await supabaseAdmin
      .from('tenants')
      .update({
        transaction_limit: newLimit,
        subscription_plan: plan,
      })
      .eq('id', tenantId);

    if (error) {
      logger.error('Failed to update transaction limit', { tenantId, plan, error: error.message });
      throw error;
    }

    logger.info('Transaction limit updated', { tenantId, plan, newLimit });
  } catch (error: any) {
    logger.error('Error updating transaction limit', { tenantId, error: error.message });
    throw error;
  }
}

/**
 * Reset transaction counter (for monthly reset)
 */
export async function resetTransactionCounter(tenantId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('tenants')
      .update({ transactions_used: 0 })
      .eq('id', tenantId);

    if (error) {
      logger.error('Failed to reset transaction counter', { tenantId, error: error.message });
      throw error;
    }

    logger.info('Transaction counter reset', { tenantId });
  } catch (error: any) {
    logger.error('Error resetting transaction counter', { tenantId, error: error.message });
    throw error;
  }
}

/**
 * Reset all transaction counters (monthly cron job)
 */
export async function resetAllTransactionCounters(): Promise<void> {
  try {
    const { error } = await supabaseAdmin.rpc('reset_monthly_transaction_counters');

    if (error) {
      logger.error('Failed to reset all transaction counters', { error: error.message });
      throw error;
    }

    logger.info('All transaction counters reset');
  } catch (error: any) {
    logger.error('Error resetting all transaction counters', { error: error.message });
    throw error;
  }
}
