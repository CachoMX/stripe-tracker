'use client';

import { useEffect, useState } from 'react';

interface Domain {
  id: string;
  email: string;
  custom_domain: string;
  subscription_plan: string | null;
  subscription_status: string | null;
  created_at: string;
  stats: {
    transactions: number;
    paymentLinks: number;
  };
}

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDomains();
  }, []);

  async function fetchDomains() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/domains');
      if (!response.ok) throw new Error('Failed to fetch domains');

      const data = await response.json();
      setDomains(data.domains || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(domain: Domain) {
    if (domain.subscription_status === 'active') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(80, 245, 172, 0.1)', color: 'var(--color-accent)' }}>Active</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>Inactive</span>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Custom Domains</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {domains.length} configured domains
          </p>
        </div>
        <button
          onClick={fetchDomains}
          className="px-4 py-2 rounded-lg transition"
          style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Domains</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{domains.length}</p>
        </div>
        <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Active Clients</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {domains.filter(d => d.subscription_status === 'active').length}
          </p>
        </div>
        <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Transactions</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {domains.reduce((sum, d) => sum + d.stats.transactions, 0)}
          </p>
        </div>
      </div>

      {/* Domains Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-4" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }}></div>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Loading domains...</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="text-6xl mb-4">🌐</div>
            <p className="text-lg font-medium">No custom domains configured yet</p>
            <p className="text-sm mt-2">Domains will appear here when clients configure them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Client Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Active Links
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Configured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ background: 'var(--color-bg-card)' }}>
                {domains.map((domain) => (
                  <tr key={domain.id} className="transition" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">🌐</span>
                        <div>
                          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {domain.custom_domain}
                          </div>
                          <a
                            href={`https://${domain.custom_domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs"
                            style={{ color: 'var(--color-accent)' }}
                          >
                            Visit
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{domain.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(domain)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm capitalize" style={{ color: 'var(--color-text-primary)' }}>
                        {domain.subscription_plan || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {domain.stats.transactions}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {domain.stats.paymentLinks}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(domain.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/admin/clients/${domain.id}`}
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        View Client
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>Domain Configuration</h3>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Custom domains are configured by clients in their dashboard settings. Each domain is automatically provisioned through Vercel with SSL certificates.
        </p>
      </div>
    </div>
  );
}
