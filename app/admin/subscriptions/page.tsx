'use client';

import { useEffect, useState } from 'react';

interface SubscriptionStats {
  active: number;
  trial: number;
  canceled: number;
  totalMRR: number;
  byPlan: {
    starter: number;
    pro: number;
    enterprise: number;
  };
}

export default function AdminSubscriptionsPage() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder - will be implemented with real data
    setTimeout(() => {
      setStats({
        active: 45,
        trial: 12,
        canceled: 8,
        totalMRR: 1305,
        byPlan: {
          starter: 20,
          pro: 22,
          enterprise: 3,
        },
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions & Revenue</h1>
        <p className="text-gray-500 mt-1">Manage client subscriptions and track revenue</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Subscriptions" value={stats?.active || 0} icon="✅" color="green" />
        <StatCard title="Trial Users" value={stats?.trial || 0} icon="🔄" color="blue" />
        <StatCard title="Canceled" value={stats?.canceled || 0} icon="❌" color="red" />
        <StatCard title="Monthly MRR" value={`$${stats?.totalMRR || 0}`} icon="💰" color="green" />
      </div>

      {/* Plans Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Subscriptions by Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlanCard
            name="Starter"
            count={stats?.byPlan.starter || 0}
            price={9}
            color="blue"
          />
          <PlanCard
            name="Pro"
            count={stats?.byPlan.pro || 0}
            price={29}
            color="purple"
          />
          <PlanCard
            name="Enterprise"
            count={stats?.byPlan.enterprise || 0}
            price={99}
            color="indigo"
          />
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">📈 Advanced Analytics Coming Soon</h2>
        <p className="text-indigo-100">
          Revenue charts, cohort analysis, churn metrics, and more
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses: any = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function PlanCard({ name, count, price, color }: any) {
  const revenue = count * price;
  const colorClasses: any = {
    blue: 'border-blue-500 bg-blue-50',
    purple: 'border-purple-500 bg-purple-50',
    indigo: 'border-indigo-500 bg-indigo-50',
  };

  return (
    <div className={`border-2 ${colorClasses[color]} rounded-lg p-6`}>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{name}</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Active:</span>
          <span className="text-sm font-medium">{count}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Price:</span>
          <span className="text-sm font-medium">${price}/mo</span>
        </div>
        <div className="flex justify-between pt-2 border-t">
          <span className="text-sm font-medium text-gray-900">MRR:</span>
          <span className="text-sm font-bold text-gray-900">${revenue}</span>
        </div>
      </div>
    </div>
  );
}
