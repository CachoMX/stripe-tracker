'use client';

import { useState, useEffect } from 'react';

export default function PaymentLinksPage() {
  const [links, setLinks] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    stripe_payment_link: '',
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
        setFormData({ name: '', stripe_payment_link: '' });
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
    } finally {
      setLoading(false);
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

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-h1">Payment Links</h1>
          <p className="text-secondary mt-2">
            Manage your Stripe payment links and track conversions
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary px-6 py-3"
        >
          + Create Payment Link
        </button>
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
              </div>
              <div>
                <label className="form-label">
                  Stripe Payment Link URL
                </label>
                <input
                  type="url"
                  value={formData.stripe_payment_link}
                  onChange={(e) => setFormData({ ...formData, stripe_payment_link: e.target.value })}
                  required
                  className="form-input"
                  placeholder="https://buy.stripe.com/..."
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

      <div className="card">
        {links.length === 0 ? (
          <div className="text-center py-12">
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
          <div className="space-y-4">
            {links.map((link: any) => (
              <div key={link.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>{link.name}</h3>
                    <a
                      href={link.stripe_payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline break-all"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {link.stripe_payment_link}
                    </a>
                    <p className="text-xs text-muted mt-2">
                      Created: {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(link.id)}
                    disabled={deleting === link.id}
                    className="ml-4 px-3 py-1 text-sm btn btn-secondary hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--color-danger)',
                      color: '#fff',
                      border: 'none'
                    }}
                  >
                    {deleting === link.id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>

                {/* Analytics Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                    <p className="text-xs text-muted mb-1">Total Revenue</p>
                    <p className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                      ${((link.stats?.totalRevenue || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                    <p className="text-xs text-muted mb-1">Total Sales</p>
                    <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {link.stats?.totalSales || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
