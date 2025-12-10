'use client';

import { useState, useEffect } from 'react';

export default function DomainsPage() {
  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<'none' | 'pending' | 'verified'>('none');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDomainInfo();
  }, []);

  const fetchDomainInfo = async () => {
    try {
      const response = await fetch('/api/domains');
      const data = await response.json();
      if (data.customDomain) {
        setCustomDomain(data.customDomain);
        setDomainStatus(data.domainVerified ? 'verified' : 'pending');
      }
    } catch (error) {
      console.error('Error fetching domain info:', error);
    }
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_domain: customDomain }),
      });

      const data = await response.json();

      if (response.ok) {
        setDomainStatus('pending');
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Domain saved! Configure DNS and click Verify.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save domain' });
      }
    } catch (error) {
      console.error('Error saving domain:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving domain' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDomain = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/domains', {
        method: 'PUT',
      });

      const data = await response.json();

      if (response.ok && data.domainVerified) {
        setDomainStatus('verified');
        setMessage({ type: 'success', text: 'Domain verified successfully!' });
      } else {
        setMessage({
          type: 'error',
          text: 'Domain not verified yet. Make sure DNS is configured correctly.'
        });
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      setMessage({ type: 'error', text: 'Failed to verify domain. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1">Custom Domain</h1>
        <p className="text-secondary mt-2">
          Configure your custom domain for thank you pages
        </p>
      </div>

      {message && (
        <div className={message.type === 'success' ? 'alert alert-success mb-6' : 'alert alert-danger mb-6'}>
          {message.text}
        </div>
      )}

      <div className="card p-8">
        {domainStatus === 'none' && !isEditing ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌐</div>
            <h3 className="text-h3 mb-2">No custom domain configured</h3>
            <p className="text-secondary mb-6 max-w-md mx-auto">
              Set up a custom domain (e.g., ty.yourdomain.com) to use for your thank you pages
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary px-6 py-3"
            >
              Configure Domain
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-h2 mb-6">Domain Configuration</h2>

            <form onSubmit={handleSaveDomain} className="space-y-6">
              <div>
                <label className="form-label">
                  Custom Domain
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="ty.yourdomain.com"
                  disabled={domainStatus === 'verified'}
                  className="form-input"
                  style={domainStatus === 'verified' ? { opacity: 0.6 } : {}}
                />
                <p className="mt-2 text-sm text-secondary">
                  Enter the subdomain you want to use for thank you pages (e.g., ty.yourdomain.com)
                </p>
              </div>

              {domainStatus !== 'verified' && (
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary px-6 py-3"
                  >
                    {loading ? 'Saving...' : 'Save Domain'}
                  </button>
                  {domainStatus === 'none' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setCustomDomain('');
                      }}
                      className="btn btn-secondary px-6 py-3"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </form>

            {domainStatus === 'pending' && (
              <div className="mt-8 alert alert-warning p-6">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>DNS Configuration Required</h3>
                <p className="text-sm text-secondary mb-4">
                  Add the following CNAME record to your DNS provider (GoDaddy, Cloudflare, Namecheap, etc.):
                </p>
                <div className="card p-4 font-mono text-sm">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted mb-1">Type</div>
                      <div style={{ color: 'var(--color-text-primary)' }}>CNAME</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-1">Name</div>
                      <div style={{ color: 'var(--color-text-primary)' }}>{customDomain.split('.')[0]}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-1">Value</div>
                      <div style={{ color: 'var(--color-text-primary)' }}>cname.vercel-dns.com</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleVerifyDomain}
                  disabled={loading}
                  className="mt-4 btn btn-primary px-6 py-2"
                >
                  {loading ? 'Verifying...' : 'Verify Domain'}
                </button>
              </div>
            )}

            {domainStatus === 'verified' && (
              <div className="mt-8">
                <div className="alert alert-success p-6 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">✅</div>
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Domain Verified</h3>
                        <p className="text-sm text-secondary mt-1">
                          Your custom domain {customDomain} is active and ready to use
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setDomainStatus('pending');
                      }}
                      className="btn btn-secondary px-4 py-2 text-sm"
                    >
                      Edit Domain
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 alert alert-info p-6">
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>How it works</h3>
              <ul className="text-sm text-secondary space-y-2">
                <li>• Your thank you pages will be accessible at: {customDomain || 'ty.yourdomain.com'}/ty?session_id=...</li>
                <li>• Customer emails will be automatically captured from Stripe sessions</li>
                <li>• Your Hyros tracking script will be injected on every thank you page</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
