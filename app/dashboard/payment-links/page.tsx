'use client';

import { useState, useEffect } from 'react';
import Toast from '@/components/Toast';

export default function PaymentLinksPage() {
  const [links, setLinks] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    product_name: '',
    amount: '',
    currency: 'usd',
    description: '',
  });

  useEffect(() => {
    fetchPaymentLinks();
  }, []);

  const fetchPaymentLinks = async () => {
    try {
      const response = await fetch('/api/payment-links');
      const data = await response.json();
      if (data.paymentLinks) {
        setLinks(data.paymentLinks);
      }
    } catch (error) {
      console.error('Error fetching payment links:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/payment-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPaymentLinks();
        setShowCreateForm(false);
        setFormData({ name: '', product_name: '', amount: '', currency: 'usd', description: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create payment link');
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (linkId: string) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/payment-links?id=${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });

      if (response.ok) {
        await fetchPaymentLinks();
        setEditing(null);
        setEditName('');
      }
    } catch (error) {
      console.error('Error renaming payment link:', error);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this payment link?')) {
      return;
    }

    setDeleting(linkId);
    try {
      const response = await fetch(`/api/payment-links?id=${linkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPaymentLinks();
      }
    } catch (error) {
      console.error('Error deleting payment link:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleSyncOldLinks = async () => {
    setSyncing(true);
    setToast({ message: 'Syncing payment links with Stripe...', type: 'info' });

    try {
      const response = await fetch('/api/payment-links/sync-stripe-ids', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          message: `Successfully synced ${data.updated} payment link(s)${data.errors > 0 ? `. ${data.errors} failed.` : ''}`,
          type: data.errors > 0 ? 'info' : 'success'
        });
        await fetchPaymentLinks();
      } else {
        setToast({ message: data.error || 'Failed to sync payment links', type: 'error' });
      }
    } catch (error) {
      console.error('Error syncing payment links:', error);
      setToast({ message: 'Failed to sync payment links', type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-h1">Payment Links</h1>
          <p className="text-secondary mt-2">
            Manage your Stripe payment links and track conversions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSyncOldLinks}
            disabled={syncing}
            className="btn btn-secondary px-6 py-3"
            title="Sync old payment links that are missing Stripe IDs"
          >
            {syncing ? '🔄 Syncing...' : '🔄 Sync Old Links'}
          </button>
          <a
            href="/dashboard/payment-links/import"
            className="btn btn-secondary px-6 py-3"
          >
            📥 Import from Stripe
          </a>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary px-6 py-3"
          >
            + Create Payment Link
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="card p-8 max-w-md w-full mx-4">
            <h2 className="text-h2">Create Payment Link</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">
                  Link Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="form-input"
                  placeholder="e.g., Premium Plan"
                />
                <p className="text-xs text-muted mt-1">
                  Internal name for tracking (not shown to customers)
                </p>
              </div>

              <div>
                <label className="form-label">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  required
                  className="form-input"
                  placeholder="e.g., Premium Subscription"
                />
                <p className="text-xs text-muted mt-1">
                  Name shown to customers on payment page
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Price
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="form-input"
                    placeholder="99.00"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="form-input"
                  >
                    <option value="usd">USD ($)</option>
                    <option value="eur">EUR (€)</option>
                    <option value="gbp">GBP (£)</option>
                    <option value="mxn">MXN ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  rows={3}
                  placeholder="Product description shown to customers..."
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn btn-primary"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {links.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-h3 mb-2">No payment links yet</h3>
          <p className="text-secondary mb-6">
            Create your first payment link to start tracking conversions
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary px-6 py-3"
          >
            Create Payment Link
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 font-semibold text-sm" style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
            <div className="col-span-3">Link Name</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-3">Thank You Page</div>
            <div className="col-span-2">Stats</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {links.map((link: any) => (
              <div
                key={link.id}
                className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-opacity-50 transition items-center"
                style={{ background: 'var(--color-bg-card)' }}
              >
                {/* Link Name Column */}
                <div className="col-span-3">
                  {editing === link.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="form-input py-1 px-2 text-sm"
                        placeholder="Enter new name"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRename(link.id)}
                        className="text-xs px-2 py-1"
                        style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '4px' }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditing(null);
                          setEditName('');
                        }}
                        className="text-xs px-2 py-1"
                        style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-primary)', borderRadius: '4px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {link.name}
                        </span>
                        <button
                          onClick={() => {
                            setEditing(link.id);
                            setEditName(link.name);
                          }}
                          className="text-xs opacity-0 group-hover:opacity-100 transition"
                          style={{ color: 'var(--color-text-secondary)' }}
                          title="Rename"
                        >
                          ✏️
                        </button>
                      </div>
                      <a
                        href={link.stripe_payment_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline block truncate"
                        style={{ color: 'var(--color-accent)' }}
                        title={link.stripe_payment_link}
                      >
                        View Stripe Link →
                      </a>
                    </div>
                  )}
                </div>

                {/* Amount Column */}
                <div className="col-span-2">
                  <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>
                    {link.amount != null ? `$${(link.amount / 100).toFixed(2)}` : 'Variable'}
                  </span>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {link.stats?.totalSales || 0} sales · ${((link.stats?.totalRevenue || 0) / 100).toFixed(2)}
                  </p>
                </div>

                {/* Thank You Page Column */}
                <div className="col-span-3">
                  {link.ty_page_url ? (
                    <a
                      href={link.ty_page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono hover:underline block truncate"
                      style={{ color: 'var(--color-accent)' }}
                      title={link.ty_page_url}
                    >
                      {link.ty_page_url}
                    </a>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Not configured
                    </span>
                  )}
                </div>

                {/* Stats Column */}
                <div className="col-span-2">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 text-xs rounded" style={{ background: 'rgba(80, 245, 172, 0.15)', color: 'var(--color-accent)' }}>
                      Active
                    </span>
                    <span className="px-2 py-1 text-xs rounded" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                      {new Date(link.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="col-span-2 flex justify-end gap-2">
                  <button
                    onClick={() => handleDelete(link.id)}
                    disabled={deleting === link.id}
                    className="px-3 py-1 text-xs rounded transition hover:opacity-80"
                    style={{
                      background: 'var(--color-danger)',
                      color: '#fff',
                    }}
                  >
                    {deleting === link.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
