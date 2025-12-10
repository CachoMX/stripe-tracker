'use client';

import { useState, useEffect } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransaction: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      if (data.transactions) {
        setTransactions(data.transactions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1">Transactions</h1>
        <p className="text-secondary mt-2">
          View all successful payments and track customer activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-small text-secondary">Total Revenue</p>
              <p className="text-h2 mt-1">
                ${(stats.totalRevenue / 100).toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-small text-secondary">Total Transactions</p>
              <p className="text-h2 mt-1">{stats.totalTransactions}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-small text-secondary">Avg. Transaction</p>
              <p className="text-h2 mt-1">
                ${(stats.avgTransaction / 100).toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-accent)' }}></div>
            <p className="text-secondary mt-4">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-h3 mb-2">No transactions yet</h3>
            <p className="text-secondary">
              Transactions will appear here once customers complete payments
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Customer Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Stripe Session ID
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-bg-card)' }}>
                {transactions.map((transaction: any, index: number) => (
                  <tr
                    key={transaction.id}
                    className="card-hover"
                    style={{ borderTop: index > 0 ? '1px solid var(--color-border)' : 'none' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {transaction.customer_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      ${(transaction.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-success">
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted font-mono">
                      {transaction.stripe_session_id}
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
