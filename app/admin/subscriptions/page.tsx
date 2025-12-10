'use client';

import { useEffect, useState } from 'react';

interface Subscription {
  id: string;
  tenant_id: string;
  email: string;
  subscription_status: string | null;
  subscription_plan: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

interface SubscriptionStats {
  active: number;
  trial: number;
  inactive: number;
  totalMRR: number;
  byPlan: {
    starter: number;
    pro: number;
    business: number;
  };
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function fetchSubscriptions() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscriptions');

      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-4" style={{ borderColor: 'var(--color-bg-hover)', borderTopColor: 'var(--color-accent)' }}></div>
        <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Subscriptions & Revenue</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>Client subscription status and revenue tracking</p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="px-4 py-2 rounded-lg transition"
          style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Subscriptions" value={stats?.active || 0} icon="✅" />
        <StatCard title="Trial Users" value={stats?.trial || 0} icon="🔄" />
        <StatCard title="Inactive" value={stats?.inactive || 0} icon="⏸️" />
        <StatCard title="Monthly MRR" value={`$${stats?.totalMRR || 0}`} icon="💰" />
      </div>

      {/* Revenue Breakdown */}
      <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)' }}>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Revenue Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg p-6" style={{ border: '2px solid var(--color-accent)', background: 'var(--color-bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Platform Subscription</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Active:</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{stats?.active || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Price:</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>$29/mo</span>
              </div>
              <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>MRR:</span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>${stats?.totalMRR || 0}</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-6" style={{ border: '2px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Trial Users</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>On Trial:</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{stats?.trial || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Inactive:</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{stats?.inactive || 0}</span>
              </div>
              <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Total:</span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{(stats?.trial || 0) + (stats?.inactive || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="rounded-lg shadow overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>All Subscriptions</h2>
        </div>
        {subscriptions.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            No subscriptions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Renewal / Trial End
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="admin-table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {sub.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(sub)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm capitalize" style={{ color: 'var(--color-text-primary)' }}>
                        {sub.subscription_plan || 'Trial'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {sub.current_period_end
                          ? new Date(sub.current_period_end).toLocaleDateString()
                          : sub.trial_ends_at
                          ? `Trial ends: ${new Date(sub.trial_ends_at).toLocaleDateString()}`
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(sub.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusBadge(sub: Subscription) {
  if (sub.subscription_status === 'active') {
    return <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(80, 245, 172, 0.2)', color: 'var(--color-accent)' }}>Active</span>;
  } else if (!sub.subscription_status && sub.trial_ends_at) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>Trial</span>;
  } else {
    return <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }}>Inactive</span>;
  }
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4" style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}>
        {icon}
      </div>
      <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
      <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
    </div>
  );
}

