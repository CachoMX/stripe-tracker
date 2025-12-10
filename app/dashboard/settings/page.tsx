'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState('');

  const [formData, setFormData] = useState({
    hyros_tracking_script: '',
    redirect_enabled: false,
    redirect_seconds: 5,
    redirect_url: '',
  });

  useEffect(() => {
    fetchTenant();

    // Check for OAuth callback messages
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    if (error) {
      setMessage({ type: 'error', text: error });
    } else if (success) {
      setMessage({ type: 'success', text: success });
      fetchTenant(); // Refresh to show connected state
    }
  }, [searchParams]);

  const fetchTenant = async () => {
    try {
      const res = await fetch('/api/tenant');
      const data = await res.json();

      if (data.tenant) {
        setStripeConnected(!!data.tenant.stripe_account_id);
        setStripeAccountId(data.tenant.stripe_account_id || '');
        setFormData({
          hyros_tracking_script: data.tenant.hyros_tracking_script || '',
          redirect_enabled: data.tenant.redirect_enabled || false,
          redirect_seconds: data.tenant.redirect_seconds || 5,
          redirect_url: data.tenant.redirect_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_STRIPE_PLATFORM_CLIENT_ID || 'ca_T2nrXjRmCKzgCkuFB8rNvcZI3hKdORBJ';
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/callback`;
    const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = stripeOAuthUrl;
  };

  const handleStripeDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Stripe account?')) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/stripe/disconnect', {
        method: 'POST',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Stripe account disconnected successfully!' });
        setStripeConnected(false);
        setStripeAccountId('');
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to disconnect Stripe' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while disconnecting' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/tenant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-h1">Settings</h1>
      <p className="text-secondary mb-8">
        Configure your Stripe API keys and Hyros tracking script
      </p>

      {message && (
        <div className={message.type === 'success' ? 'alert alert-success' : 'alert alert-danger'}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Stripe Configuration */}
        <div className="card">
          <h2 className="text-h2">
            💳 Stripe Configuration
          </h2>

          {stripeConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-success)' }}>
                      ✓ Stripe Connected
                    </p>
                    <p className="text-sm text-muted mt-1">
                      Account ID: {stripeAccountId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStripeDisconnect}
                    disabled={saving}
                    className="px-4 py-2 btn btn-secondary text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
              <div className="p-3 alert alert-info" style={{ marginBottom: 0 }}>
                <p className="text-sm">
                  Your Stripe account is securely connected via OAuth. You can now create payment links and track transactions.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-secondary">
                Connect your Stripe account securely to start accepting payments and tracking transactions.
              </p>
              <button
                type="button"
                onClick={handleStripeConnect}
                className="px-6 py-3 btn btn-primary flex items-center gap-2"
                style={{ backgroundColor: '#635BFF', borderColor: '#635BFF' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                </svg>
                Connect with Stripe
              </button>
              <div className="p-3 alert alert-info" style={{ marginBottom: 0 }}>
                <p className="text-sm">
                  <strong>Secure OAuth Connection:</strong> You'll be redirected to Stripe to authorize access. We never see or store your Stripe password.
                </p>
              </div>
            </div>
          )}
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Hyros Configuration */}
        <div className="card">
          <h2 className="text-h2">
            🎯 Hyros Tracking Script
          </h2>

          <div>
            <label className="form-label">
              Universal Tracking Script *
            </label>
            <textarea
              value={formData.hyros_tracking_script}
              onChange={(e) =>
                setFormData({ ...formData, hyros_tracking_script: e.target.value })
              }
              placeholder='<script>
var head = document.head;
var script = document.createElement("script");
script.src = "https://data.hyros.com/...";
head.appendChild(script);
</script>'
              rows={8}
              className="form-input font-mono text-sm"
              required
            />
            <p className="text-xs text-muted mt-1">
              Paste your Hyros universal tracking script here (will be injected in {"<head>"})
            </p>
          </div>

          <div className="mt-4 p-3 alert alert-info">
            <p className="text-sm">
              <strong>Where to find:</strong> Go to Hyros Dashboard → Universal Script
            </p>
          </div>
        </div>

        {/* Post-Payment Redirect Configuration */}
        <div className="card">
          <h2 className="text-h2">
            🔄 Post-Payment Redirect
          </h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="redirect_enabled"
                checked={formData.redirect_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, redirect_enabled: e.target.checked })
                }
                className="w-4 h-4 rounded"
                style={{
                  accentColor: 'var(--color-accent)',
                  border: '1px solid var(--color-border)'
                }}
              />
              <label htmlFor="redirect_enabled" className="ml-2 text-sm font-medium">
                Enable automatic redirect after payment
              </label>
            </div>

            {formData.redirect_enabled && (
              <>
                <div>
                  <label className="form-label">
                    Wait Time (seconds) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.redirect_seconds}
                    onChange={(e) =>
                      setFormData({ ...formData, redirect_seconds: parseInt(e.target.value) || 5 })
                    }
                    className="form-input"
                    required
                  />
                  <p className="text-xs text-muted mt-1">
                    Number of seconds to wait before redirecting (1-60)
                  </p>
                </div>

                <div>
                  <label className="form-label">
                    Redirect URL *
                  </label>
                  <input
                    type="url"
                    value={formData.redirect_url}
                    onChange={(e) =>
                      setFormData({ ...formData, redirect_url: e.target.value })
                    }
                    placeholder="https://yourwebsite.com/next-step"
                    className="form-input"
                    required
                  />
                  <p className="text-xs text-muted mt-1">
                    Full URL where customers will be redirected after payment
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 p-3 alert alert-info">
            <p className="text-sm">
              <strong>Tip:</strong> Use this to redirect customers to the next step in your funnel after a successful payment.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2 btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
