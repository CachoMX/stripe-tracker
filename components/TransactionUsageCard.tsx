'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface UsageStats {
  transactionLimit: number;
  transactionsUsed: number;
  usagePercentage: number;
  remainingTransactions: number;
  subscriptionPlan: string;
}

export default function TransactionUsageCard() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('tenant_usage_stats')
          .select('*')
          .eq('clerk_user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching usage:', error);
          return;
        }

        if (data) {
          setUsage({
            transactionLimit: data.transaction_limit,
            transactionsUsed: data.transactions_used,
            usagePercentage: data.usage_percentage || 0,
            remainingTransactions: data.remaining_transactions,
            subscriptionPlan: data.subscription_plan || 'basic',
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const isUnlimited = usage.transactionLimit === -1;
  const isNearLimit = usage.usagePercentage >= 90;
  const isAtLimit = usage.usagePercentage >= 100;

  const getProgressColor = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-yellow-600';
    return 'text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transaction Usage</h3>
          <p className="text-sm text-gray-500 capitalize">
            {usage.subscriptionPlan} Plan
          </p>
        </div>
        {isAtLimit && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Limit Reached
          </span>
        )}
        {isNearLimit && !isAtLimit && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Near Limit
          </span>
        )}
      </div>

      {isUnlimited ? (
        <div className="text-center py-4">
          <p className="text-2xl font-bold text-gray-900">Unlimited</p>
          <p className="text-sm text-gray-500 mt-1">
            {usage.transactionsUsed.toLocaleString()} transactions used this month
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-baseline mb-2">
            <p className={`text-2xl font-bold ${getTextColor()}`}>
              {usage.transactionsUsed.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              of {usage.transactionLimit.toLocaleString()}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className={`${getProgressColor()} h-2.5 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(usage.usagePercentage, 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {usage.remainingTransactions.toLocaleString()} remaining
            </span>
            <span className={getTextColor()}>
              {usage.usagePercentage.toFixed(1)}% used
            </span>
          </div>

          {isAtLimit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                You've reached your transaction limit. Upgrade your plan to continue processing transactions.
              </p>
              <a
                href="/dashboard/billing"
                className="inline-block mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Upgrade Plan →
              </a>
            </div>
          )}

          {isNearLimit && !isAtLimit && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                You're approaching your transaction limit. Consider upgrading to avoid service interruption.
              </p>
              <a
                href="/dashboard/billing"
                className="inline-block mt-2 text-sm font-medium text-yellow-600 hover:text-yellow-700"
              >
                View Plans →
              </a>
            </div>
          )}
        </>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Usage resets monthly on your billing date
        </p>
      </div>
    </div>
  );
}
