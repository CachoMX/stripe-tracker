'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaymentLink {
  id: string;
  tenant_id: string;
  name: string;
  stripe_payment_link: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  tenants: {
    email: string;
    custom_domain: string | null;
    subscription_plan: string | null;
  };
  stats: {
    totalRevenue: number;
    totalSales: number;
  };
}

interface Summary {
  totalRevenue: number;
  totalSales: number;
  activeLinks: number;
  inactiveLinks: number;
}

export default function AdminPaymentLinksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeOnly, setActiveOnly] = useState(searchParams.get('activeOnly') === 'true');

  useEffect(() => {
    fetchPaymentLinks();
  }, [searchParams]);

  async function fetchPaymentLinks() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeOnly) params.set('activeOnly', 'true');

      const response = await fetch(`/api/admin/payment-links?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch payment links');

      const data = await response.json();
      setPaymentLinks(data.paymentLinks || []);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching payment links:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (activeOnly) params.set('activeOnly', 'true');
    router.push(`/admin/payment-links?${params.toString()}`);
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Payment Links</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {paymentLinks.length} total links
          </p>
        </div>
        <button
          onClick={fetchPaymentLinks}
          className="px-4 py-2 rounded-lg transition"
          style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
        >
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Active Links</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{summary.activeLinks}</p>
          </div>
          <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Inactive Links</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{summary.inactiveLinks}</p>
          </div>
          <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Sales</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{summary.totalSales}</p>
          </div>
          <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Revenue</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>${summary.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <form onSubmit={handleFilter} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Search by Name
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Link name..."
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-offset-0"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Active only</span>
              </label>
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

      {/* Payment Links Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-4" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }}></div>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Loading payment links...</p>
          </div>
        ) : paymentLinks.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            No payment links found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Link Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ background: 'var(--color-bg-card)' }}>
                {paymentLinks.map((link) => (
                  <tr key={link.id} className="transition" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {link.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {link.tenants.email}
                      </div>
                      {link.tenants.custom_domain && (
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {link.tenants.custom_domain}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {link.active ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(80, 245, 172, 0.1)', color: 'var(--color-accent)' }}>
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {link.stats.totalSales}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        ${link.stats.totalRevenue.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(link.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => copyLink(link.stripe_payment_link)}
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
