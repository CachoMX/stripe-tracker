'use client';

import { useState, useEffect } from 'react';

function CheckoutCard({ session }: { session: any }) {
  const [testLoading, setTestLoading] = useState(false);
  const [testUrl, setTestUrl] = useState('');

  const handleTestCheckout = async () => {
    setTestLoading(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutSessionId: session.id }),
      });

      const data = await response.json();
      if (data.url) {
        setTestUrl(data.url);
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating test checkout:', error);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="card-hover p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>{session.name}</h3>
          <p className="text-sm text-secondary">{session.product_name}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            ${(session.amount / 100).toFixed(2)} {session.currency.toUpperCase()}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted mt-2">
        Created: {new Date(session.created_at).toLocaleDateString()}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleTestCheckout}
          disabled={testLoading}
          className="px-4 py-2 btn btn-primary text-sm"
        >
          {testLoading ? 'Creating...' : '🧪 Test Checkout'}
        </button>
        {testUrl && (
          <a
            href={testUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 btn btn-secondary text-sm"
          >
            Open Link
          </a>
        )}
      </div>
    </div>
  );
}

export default function CheckoutsPage() {
  const [sessions, setSessions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'usd',
    product_name: '',
  });

  useEffect(() => {
    fetchCheckoutSessions();
  }, []);

  const fetchCheckoutSessions = async () => {
    try {
      const response = await fetch('/api/checkouts');
      const data = await response.json();
      if (data.checkoutSessions) {
        setSessions(data.checkoutSessions);
      }
    } catch (error) {
      console.error('Error fetching checkout sessions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCheckoutSessions();
        setShowCreateForm(false);
        setFormData({ name: '', amount: '', currency: 'usd', product_name: '' });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-h1">Checkout Sessions</h1>
          <p className="text-secondary mt-2">
            Create and manage Stripe checkout sessions
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary px-6 py-3"
        >
          + Create Checkout
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="card p-8 max-w-md w-full mx-4">
            <h2 className="text-h2">Create Checkout Session</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">
                  Session Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="form-input"
                  placeholder="e.g., Pro Plan Checkout"
                />
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
                  placeholder="e.g., Pro Plan"
                />
              </div>
              <div>
                <label className="form-label">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
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
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                  <option value="mxn">MXN</option>
                </select>
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
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-h3 mb-2">No checkout sessions yet</h3>
            <p className="text-secondary mb-6">
              Create your first checkout session to start accepting payments
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary px-6 py-3"
            >
              Create Checkout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session: any) => (
              <CheckoutCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
