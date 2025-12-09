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
        <h1 className="text-3xl font-bold text-gray-900">Custom Domain</h1>
        <p className="text-gray-600 mt-2">
          Configure your custom domain for thank you pages
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {domainStatus === 'none' && !isEditing ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No custom domain configured</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Set up a custom domain (e.g., ty.yourdomain.com) to use for your thank you pages
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Configure Domain
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-6">Domain Configuration</h2>

            <form onSubmit={handleSaveDomain} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="ty.yourdomain.com"
                  disabled={domainStatus === 'verified'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Enter the subdomain you want to use for thank you pages (e.g., ty.yourdomain.com)
                </p>
              </div>

              {domainStatus !== 'verified' && (
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
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
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </form>

            {domainStatus === 'pending' && (
              <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-4">DNS Configuration Required</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Add the following CNAME record to your DNS settings:
                </p>
                <div className="bg-white p-4 rounded border border-yellow-300 font-mono text-sm">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Type</div>
                      <div>CNAME</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Name</div>
                      <div>{customDomain}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Value</div>
                      <div>cname.vercel-dns.com</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleVerifyDomain}
                  disabled={loading}
                  className="mt-4 bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Domain'}
                </button>
              </div>
            )}

            {domainStatus === 'verified' && (
              <div className="mt-8">
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">✅</div>
                      <div>
                        <h3 className="font-semibold text-green-900">Domain Verified</h3>
                        <p className="text-sm text-green-800 mt-1">
                          Your custom domain {customDomain} is active and ready to use
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setDomainStatus('pending');
                      }}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Edit Domain
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-2">
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
