'use client';

import { useEffect, useState } from 'react';

interface AdminStats {
  totalClients: number;
  activeClients: number;
  transactionsLast30Days: number;
  totalRevenue: number;
  recentRevenue: number;
  revenueGrowth: number;
  activePaymentLinks: number;
  customDomains: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Failed to load admin statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500 mt-1">Global statistics and insights</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon="👥"
          color="blue"
          subtitle={`${stats.activeClients} active`}
        />

        {/* Active Subscriptions */}
        <StatCard
          title="Active Subscriptions"
          value={stats.activeClients}
          icon="✅"
          color="green"
          subtitle={`${Math.round((stats.activeClients / stats.totalClients) * 100)}% of total`}
        />

        {/* Transactions (30d) */}
        <StatCard
          title="Transactions (30d)"
          value={stats.transactionsLast30Days}
          icon="💰"
          color="purple"
          subtitle={`${Math.round(stats.transactionsLast30Days / 30)}/day avg`}
        />

        {/* Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="💵"
          color="green"
          subtitle="All time"
        />

        {/* Recent Revenue */}
        <StatCard
          title="Last 7 Days Revenue"
          value={`$${stats.recentRevenue.toLocaleString()}`}
          icon="📈"
          color="indigo"
          subtitle={
            stats.revenueGrowth >= 0
              ? `↗ ${stats.revenueGrowth}% vs prev week`
              : `↘ ${Math.abs(stats.revenueGrowth)}% vs prev week`
          }
          trend={stats.revenueGrowth >= 0 ? 'up' : 'down'}
        />

        {/* Active Payment Links */}
        <StatCard
          title="Active Payment Links"
          value={stats.activePaymentLinks}
          icon="🔗"
          color="blue"
          subtitle="Currently active"
        />

        {/* Custom Domains */}
        <StatCard
          title="Custom Domains"
          value={stats.customDomains}
          icon="🌐"
          color="purple"
          subtitle="Configured"
        />

        {/* MRR (placeholder) */}
        <StatCard
          title="MRR (Estimate)"
          value={`$${Math.round(stats.activeClients * 29).toLocaleString()}`}
          icon="🔄"
          color="green"
          subtitle="Monthly Recurring"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            href="/admin/clients"
            icon="👥"
            title="Manage Clients"
            description="View and manage all clients"
          />
          <QuickActionButton
            href="/admin/transactions"
            icon="💰"
            title="View Transactions"
            description="Browse all transactions"
          />
          <QuickActionButton
            href="/admin/analytics"
            icon="📈"
            title="Analytics"
            description="Detailed revenue analytics"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'indigo';
  subtitle?: string;
  trend?: 'up' | 'down';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↗' : '↘'}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function QuickActionButton({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition group"
    >
      <div className="text-3xl group-hover:scale-110 transition">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
          {title}
        </h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </a>
  );
}
