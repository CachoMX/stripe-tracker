'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Transaction {
  id: string;
  tenant_id: string;
  stripe_session_id: string;
  customer_email: string;
  customer_name: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  tenants: {
    email: string;
    custom_domain: string | null;
  };
}

interface TransactionSummary {
  totalAmount: number;
  averageAmount: number;
  count: number;
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState(searchParams.get('client') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  useEffect(() => {
    fetchTransactions();
  }, [searchParams]);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (clientFilter) params.set('client', clientFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await fetch(`/api/admin/transactions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.transactions || []);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (clientFilter) params.set('client', clientFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    router.push(`/admin/transactions?${params.toString()}`);
  }

  function exportToCSV() {
    const csv = [
      ['Date', 'Client Email', 'Customer Email', 'Customer Name', 'Amount', 'Currency', 'Status', 'Session ID'].join(','),
      ...transactions.map((t) =>
        [
          new Date(t.created_at).toLocaleString(),
          t.tenants.email,
          t.customer_email,
          t.customer_name || 'N/A',
          (t.amount / 100).toFixed(2),
          t.currency.toUpperCase(),
          t.status,
          t.stripe_session_id,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Transactions</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {transactions.length} transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            disabled={transactions.length === 0}
            className="px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 rounded-lg transition"
            style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Amount</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              ${summary.totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Average Transaction</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              ${summary.averageAmount.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Count</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {summary.count}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)' }}>
        <form onSubmit={handleFilter} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client ID Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Client ID (Tenant ID)
              </label>
              <input
                type="text"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                placeholder="Enter tenant ID..."
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg transition"
              style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setClientFilter('');
                setDateFrom('');
                setDateTo('');
                router.push('/admin/transactions');
              }}
              className="px-6 py-2 rounded-lg transition"
              style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="rounded-lg shadow overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-4" style={{ borderColor: 'var(--color-bg-hover)', borderTopColor: 'var(--color-accent)' }}></div>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Session ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="admin-table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {transaction.tenants.email}
                      </div>
                      {transaction.tenants.custom_domain && (
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {transaction.tenants.custom_domain}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {transaction.customer_email}
                      </div>
                      {transaction.customer_name && (
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {transaction.customer_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        ${(transaction.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-xs uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                        {transaction.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(80, 245, 172, 0.2)', color: 'var(--color-accent)' }}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {transaction.stripe_session_id.substring(0, 20)}...
                      </code>
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
