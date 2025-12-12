'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  revenueChart: { date: string; revenue: number; transactions: number }[];
  clientGrowth: { date: string; newClients: number }[];
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
  };
  topClients: {
    id: string;
    email: string;
    subscription_plan: string;
    revenue: number;
  }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-4" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }}></div>
        <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg p-6" style={{ background: 'rgba(245, 80, 80, 0.1)', border: '1px solid rgba(245, 80, 80, 0.3)' }}>
        <p style={{ color: '#f55050' }}>Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Analytics</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>Revenue and growth metrics</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 rounded-lg"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            outline: 'none'
          }}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Revenue</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            ${data.summary.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>Last {period} days</p>
        </div>
        <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Transactions</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {data.summary.totalTransactions}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            ${data.summary.averageTransactionValue.toFixed(2)} avg
          </p>
        </div>
        <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>New Clients</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {data.clientGrowth.reduce((sum, d) => sum + d.newClients, 0)}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>Last {period} days</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenueChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              stroke="var(--color-border)"
            />
            <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} stroke="var(--color-border)" />
            <Tooltip
              formatter={(value: number) => `$${value.toFixed(2)}`}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <Legend wrapperStyle={{ color: 'var(--color-text-primary)' }} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#50f5ac"
              strokeWidth={2}
              name="Revenue ($)"
              dot={{ fill: '#50f5ac', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Chart */}
      <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Transactions Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenueChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              stroke="var(--color-border)"
            />
            <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} stroke="var(--color-border)" />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <Legend wrapperStyle={{ color: 'var(--color-text-primary)' }} />
            <Line
              type="monotone"
              dataKey="transactions"
              stroke="#50f5ac"
              strokeWidth={2}
              name="Transactions"
              dot={{ fill: '#50f5ac', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Client Growth Chart */}
      {data.clientGrowth.length > 0 && (
        <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>New Clients</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.clientGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="var(--color-border)"
              />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} stroke="var(--color-border)" />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
              <Legend wrapperStyle={{ color: 'var(--color-text-primary)' }} />
              <Line
                type="monotone"
                dataKey="newClients"
                stroke="#50f5ac"
                strokeWidth={2}
                name="New Clients"
                dot={{ fill: '#50f5ac', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Clients */}
      <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Top Clients by Revenue</h2>
        <div className="space-y-3">
          {data.topClients.map((client, index) => (
            <div
              key={client.id}
              className="flex items-center justify-between p-4 rounded-lg transition"
              style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold" style={{ color: 'var(--color-text-secondary)' }}>#{index + 1}</div>
                <div>
                  <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{client.email}</div>
                  <div className="text-sm capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                    {client.subscription_plan || 'Trial'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
                  ${client.revenue.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>revenue</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
