'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ClientStats {
  transactions: number;
  paymentLinks: number;
  revenue: number;
}

interface Client {
  id: string;
  email: string;
  subscription_status: string | null;
  subscription_plan: string | null;
  custom_domain: string | null;
  stripe_connected: boolean;
  created_at: string;
  trial_ends_at: string | null;
  stats: ClientStats;
}

export default function AdminClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [planFilter, setPlanFilter] = useState(searchParams.get('plan') || 'all');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkPlan, setBulkPlan] = useState('');

  useEffect(() => {
    fetchClients();
  }, [searchParams]);

  async function fetchClients() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (planFilter !== 'all') params.set('plan', planFilter);

      const response = await fetch(`/api/admin/clients?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch clients');

      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (planFilter !== 'all') params.set('plan', planFilter);
    router.push(`/admin/clients?${params.toString()}`);
  }

  function getStatusBadge(client: Client) {
    if (client.subscription_status === 'active') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(80, 245, 172, 0.2)', color: 'var(--color-accent)' }}>Active</span>;
    } else if (client.trial_ends_at && new Date(client.trial_ends_at) > new Date()) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>Trial</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }}>Inactive</span>;
    }
  }

  function toggleClient(clientId: string) {
    setSelectedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  }

  function toggleAll() {
    if (selectedClients.size === clients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(clients.map(c => c.id)));
    }
  }

  async function handleBulkEdit() {
    if (selectedClients.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedClients).map(clientId =>
          fetch(`/api/admin/clients/${clientId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription_status: bulkStatus || undefined,
              subscription_plan: bulkPlan || undefined,
            }),
          })
        )
      );

      setShowBulkEditModal(false);
      setSelectedClients(new Set());
      setBulkStatus('');
      setBulkPlan('');
      fetchClients();
      alert(`Successfully updated ${selectedClients.size} client(s)`);
    } catch (error) {
      console.error('Error updating clients:', error);
      alert('Failed to update clients');
    }
  }

  async function handleBulkDelete() {
    if (selectedClients.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedClients.size} client(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedClients).map(clientId =>
          fetch(`/api/admin/clients/${clientId}`, {
            method: 'DELETE',
          })
        )
      );

      setSelectedClients(new Set());
      fetchClients();
      alert(`Successfully deleted ${selectedClients.size} client(s)`);
    } catch (error) {
      console.error('Error deleting clients:', error);
      alert('Failed to delete clients');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Clients</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {clients.length} total clients
          </p>
        </div>
        <button
          onClick={fetchClients}
          className="px-4 py-2 rounded-lg transition"
          style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)' }}>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Email or domain..."
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Plan Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Plan
              </label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2 rounded-lg transition"
            style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Clients Table */}
      <div className="rounded-lg shadow overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-4" style={{ borderColor: 'var(--color-bg-hover)', borderTopColor: 'var(--color-accent)' }}></div>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            No clients found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th className="px-6 py-3 text-left" style={{ color: 'var(--color-text-secondary)', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedClients.size === clients.length && clients.length > 0}
                      onChange={toggleAll}
                      className="rounded"
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </th>
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
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Links
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                {clients.map((client) => (
                  <tr key={client.id} className="admin-table-row">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.has(client.id)}
                        onChange={() => toggleClient(client.id)}
                        className="rounded"
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {client.email}
                        </div>
                        {client.custom_domain && (
                          <div className="text-xs flex items-center mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                            🌐 {client.custom_domain}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(client)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm capitalize" style={{ color: 'var(--color-text-primary)' }}>
                        {client.subscription_plan || 'Basic'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        ${client.stats.revenue.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {client.stats.transactions}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {client.stats.paymentLinks}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(client.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/admin/clients/${client.id}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedClients.size > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 shadow-lg"
          style={{
            background: 'var(--color-bg-card)',
            borderTop: '2px solid var(--color-accent)',
            zIndex: 50
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Selected {selectedClients.size} lead{selectedClients.size !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedClients(new Set())}
                className="text-sm hover:underline"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Clear selection
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkEditModal(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                Edit
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                Delete leads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="rounded-lg shadow-xl p-6 max-w-md w-full mx-4" style={{ background: 'var(--color-bg-card)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Edit {selectedClients.size} Client{selectedClients.size !== 1 ? 's' : ''}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Status
                </label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Keep current</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="trialing">Trial</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Plan
                </label>
                <input
                  type="text"
                  value={bulkPlan}
                  onChange={(e) => setBulkPlan(e.target.value)}
                  placeholder="Keep current"
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkEditModal(false);
                  setBulkStatus('');
                  setBulkPlan('');
                }}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-primary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkEdit}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
