'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Client {
  id: string;
  email: string;
  subscription_status: string | null;
  subscription_plan: string | null;
  trial_ends_at: string | null;
  created_at: string;
  stripe_connected: boolean;
  custom_domain: string | null;
  domain_verified: boolean;
}

interface ClientStats {
  transactions: number;
  paymentLinks: number;
  revenue: number;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPlan, setEditedPlan] = useState('');

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  async function fetchClient() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/clients/${clientId}`);
      if (!response.ok) throw new Error('Failed to fetch client');

      const data = await response.json();
      setClient(data.client);
      setStats(data.stats);
      setEditedEmail(data.client.email);
      setEditedPlan(data.client.subscription_plan || 'basic');
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete client ${client?.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      alert('Client deleted successfully');
      router.push('/admin/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpdate() {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editedEmail,
          subscription_plan: editedPlan,
        }),
      });

      if (!response.ok) throw new Error('Failed to update client');

      alert('Client updated successfully');
      setEditing(false);
      fetchClient();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client');
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-4" style={{ borderColor: 'var(--color-bg-hover)', borderTopColor: 'var(--color-accent)' }}></div>
        <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Loading client...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid #ef4444' }}>
          <p style={{ color: '#ef4444' }}>Client not found</p>
          <Link href="/admin/clients" className="mt-4 inline-block" style={{ color: 'var(--color-accent)' }}>
            ← Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/clients" style={{ color: 'var(--color-accent)' }} className="text-sm mb-2 inline-block">
            ← Back to Clients
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Client Details</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>{client.email}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 rounded-lg transition"
            style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
          >
            {editing ? 'Cancel Edit' : 'Edit Client'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-lg transition disabled:opacity-50"
            style={{ background: 'var(--color-danger)', color: '#ffffff' }}
          >
            {deleting ? 'Deleting...' : 'Delete Client'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="text-3xl mb-4">💰</div>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Revenue</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>${stats?.revenue.toFixed(2) || '0.00'}</p>
        </div>
        <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="text-3xl mb-4">📊</div>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Transactions</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats?.transactions || 0}</p>
        </div>
        <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="text-3xl mb-4">🔗</div>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Payment Links</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats?.paymentLinks || 0}</p>
        </div>
      </div>

      {/* Client Information */}
      <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)' }}>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Client Information</h2>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Email</label>
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Subscription Plan</label>
              <select
                value={editedPlan}
                onChange={(e) => setEditedPlan(e.target.value)}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>
            <button
              onClick={handleUpdate}
              className="px-6 py-2 rounded-lg transition"
              style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow label="Email" value={client.email} />
            <InfoRow label="Client ID" value={client.id} />
            <InfoRow label="Status" value={getStatusText(client)} badge />
            <InfoRow label="Plan" value={client.subscription_plan || 'Trial'} />
            <InfoRow label="Trial Ends" value={client.trial_ends_at ? new Date(client.trial_ends_at).toLocaleDateString() : 'N/A'} />
            <InfoRow label="Joined" value={new Date(client.created_at).toLocaleDateString()} />
            <InfoRow label="Stripe Connected" value={client.stripe_connected ? 'Yes' : 'No'} />
            <InfoRow label="Custom Domain" value={client.custom_domain || 'None'} />
            <InfoRow label="Domain Verified" value={client.domain_verified ? 'Yes' : 'No'} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div>
      <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      {badge ? (
        <span className="px-2 py-1 text-sm font-medium rounded-full" style={{ background: 'rgba(80, 245, 172, 0.2)', color: 'var(--color-accent)' }}>
          {value}
        </span>
      ) : (
        <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
      )}
    </div>
  );
}

function getStatusText(client: Client) {
  if (client.subscription_status === 'active') return 'Active';
  if (client.subscription_status === 'trialing' || client.subscription_status === 'trial') return 'Trial';
  return 'Inactive';
}
