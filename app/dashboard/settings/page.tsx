'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    stripe_secret_key: '',
    stripe_publishable_key: '',
    hyros_tracking_script: '',
    redirect_enabled: false,
    redirect_seconds: 5,
    redirect_url: '',
  });

  useEffect(() => {
    fetchTenant();
  }, []);

  const fetchTenant = async () => {
    try {
      const res = await fetch('/api/tenant');
      const data = await res.json();

      if (data.tenant) {
        setFormData({
          stripe_secret_key: data.tenant.stripe_secret_key || '',
          stripe_publishable_key: data.tenant.stripe_publishable_key || '',
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
        setTimeout(() => router.push('/dashboard'), 1500);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stripe Configuration */}
        <div className="card">
          <h2 className="text-h2">
            💳 Stripe Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="form-label">
                Secret Key *
              </label>
              <input
                type="password"
                value={formData.stripe_secret_key}
                onChange={(e) =>
                  setFormData({ ...formData, stripe_secret_key: e.target.value })
                }
                placeholder="sk_test_..."
                className="form-input"
                required
              />
              <p className="text-xs text-muted mt-1">
                Your Stripe secret key (starts with sk_test_ or sk_live_)
              </p>
            </div>

            <div>
              <label className="form-label">
                Publishable Key *
              </label>
              <input
                type="text"
                value={formData.stripe_publishable_key}
                onChange={(e) =>
                  setFormData({ ...formData, stripe_publishable_key: e.target.value })
                }
                placeholder="pk_test_..."
                className="form-input"
                required
              />
              <p className="text-xs text-muted mt-1">
                Your Stripe publishable key (starts with pk_test_ or pk_live_)
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 alert alert-info" style={{ marginBottom: 0 }}>
            <p className="text-sm">
              <strong>Where to find:</strong> Go to{' '}
              <a
                href="https://dashboard.stripe.com/test/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Stripe Dashboard → API Keys
              </a>
            </p>
          </div>
        </div>

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
  );
}
