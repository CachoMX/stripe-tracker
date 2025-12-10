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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Admin Overview</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-lg shadow p-6 animate-pulse" style={{ background: 'var(--color-bg-card)' }}>
              <div className="h-4 rounded w-1/2 mb-4" style={{ background: 'var(--color-bg-hover)' }}></div>
              <div className="h-8 rounded w-3/4" style={{ background: 'var(--color-bg-hover)' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid #ef4444' }}>
        <p style={{ color: '#ef4444' }}>Failed to load admin statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Admin Overview</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>Global statistics and insights</p>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Last updated</p>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon="👥"
          subtitle={`${stats.activeClients} active`}
        />

        {/* Active Subscriptions */}
        <StatCard
          title="Active Subscriptions"
          value={stats.activeClients}
          icon="✅"
          subtitle={`${Math.round((stats.activeClients / stats.totalClients) * 100)}% of total`}
        />

        {/* Transactions (30d) */}
        <StatCard
          title="Transactions (30d)"
          value={stats.transactionsLast30Days}
          icon="💰"
          subtitle={`${Math.round(stats.transactionsLast30Days / 30)}/day avg`}
        />

        {/* Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="💵"
          subtitle="All time"
        />

        {/* Recent Revenue */}
        <StatCard
          title="Last 7 Days Revenue"
          value={`$${stats.recentRevenue.toLocaleString()}`}
          icon="📈"
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
          subtitle="Currently active"
        />

        {/* Custom Domains */}
        <StatCard
          title="Custom Domains"
          value={stats.customDomains}
          icon="🌐"
          subtitle="Configured"
        />

        {/* MRR (placeholder) */}
        <StatCard
          title="MRR (Estimate)"
          value={`$${Math.round(stats.activeClients * 29).toLocaleString()}`}
          icon="🔄"
          subtitle="Monthly Recurring"
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h2>
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
  subtitle,
  trend,
}: {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="rounded-lg shadow hover:shadow-lg transition p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}>
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-medium`} style={{ color: trend === 'up' ? 'var(--color-accent)' : '#ef4444' }}>
            {trend === 'up' ? '↗' : '↘'}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
        <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
        {subtitle && (
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</p>
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
      className="flex items-start space-x-4 p-4 rounded-lg hover:shadow-md transition group"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-card)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <div className="text-3xl group-hover:scale-110 transition">{icon}</div>
      <div>
        <h3 className="font-semibold group-hover:transition" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
      </div>
    </a>
  );
}
