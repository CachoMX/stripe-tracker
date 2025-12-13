'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AvailableLink {
  id: string;
  url: string;
  active: boolean;
  amount: number;
  currency: string;
  product_name: string;
  description: string | null;
  metadata: Record<string, string>;
  existing_ty_page_url: string | null;
}

interface ImportLinkWithUrl extends AvailableLink {
  tyPageUrl: string;
  selected: boolean;
}

interface Domain {
  domain: string;
  ty_page_url: string;
}

export default function ImportPaymentLinksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [availableLinks, setAvailableLinks] = useState<AvailableLink[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [alreadyImported, setAlreadyImported] = useState(0);
  const [linksWithUrls, setLinksWithUrls] = useState<ImportLinkWithUrl[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  useEffect(() => {
    fetchAvailableLinks();
  }, []);

  async function fetchAvailableLinks() {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-links/import');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch available links');
      }

      const data = await response.json();
      setAvailableLinks(data.availableLinks || []);
      setDomains(data.domains || []);
      setTotalCount(data.totalCount || 0);
      setAlreadyImported(data.alreadyImported || 0);

      // Initialize with existing ty_page_url if available, otherwise empty
      setLinksWithUrls(
        (data.availableLinks || []).map((link: AvailableLink) => ({
          ...link,
          tyPageUrl: link.existing_ty_page_url || '',
          selected: true,
        }))
      );
    } catch (err: any) {
      console.error('Error fetching available links:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleUrlChange(linkId: string, tyPageUrl: string) {
    setLinksWithUrls((prev) =>
      prev.map((link) =>
        link.id === linkId ? { ...link, tyPageUrl } : link
      )
    );
  }

  function handleToggleSelect(linkId: string) {
    setLinksWithUrls((prev) =>
      prev.map((link) =>
        link.id === linkId ? { ...link, selected: !link.selected } : link
      )
    );
  }

  function handleSelectAll() {
    setLinksWithUrls((prev) => prev.map((link) => ({ ...link, selected: true })));
  }

  function handleDeselectAll() {
    setLinksWithUrls((prev) => prev.map((link) => ({ ...link, selected: false })));
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setShowCopiedToast(true);
    setTimeout(() => {
      setShowCopiedToast(false);
    }, 2000);
  }

  function handleProceedToImport() {
    const selectedLinks = linksWithUrls.filter((link) => link.selected);

    if (selectedLinks.length === 0) {
      alert('Please select at least one payment link to import');
      return;
    }

    // Validate that all selected links have a ty_page_url
    const missingUrls = selectedLinks.filter((link) => !link.tyPageUrl.trim());
    if (missingUrls.length > 0) {
      alert(`Please add Thank You Page URLs for all ${missingUrls.length} selected payment link(s)`);
      return;
    }

    setShowConfirmModal(true);
  }

  async function handleConfirmImport() {
    try {
      setImporting(true);
      setShowConfirmModal(false);

      const linksToImport = linksWithUrls
        .filter((link) => link.selected)
        .map((link) => ({
          linkId: link.id,
          tyPageUrl: link.tyPageUrl,
        }));

      const response = await fetch('/api/payment-links/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linksToImport }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import payment links');
      }

      const result = await response.json();

      // Show success message
      alert(
        `Successfully imported ${result.imported} payment link(s)!${
          result.failed > 0 ? `\n${result.failed} failed to import.` : ''
        }`
      );

      // Redirect back to payment links page
      router.push('/dashboard/payment-links');
    } catch (err: any) {
      console.error('Error importing payment links:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-lg shadow p-8 text-center" style={{ background: 'var(--color-bg-card)' }}>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-4 mb-4" style={{ borderColor: 'var(--color-bg-hover)', borderTopColor: 'var(--color-accent)' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading available payment links from Stripe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)', border: '2px solid var(--color-danger)' }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-danger)' }}>Error Loading Payment Links</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
          <button
            onClick={() => router.push('/dashboard/payment-links')}
            className="mt-4 px-4 py-2 rounded-lg transition"
            style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-primary)' }}
          >
            ← Back to Payment Links
          </button>
        </div>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-lg shadow p-8 text-center" style={{ background: 'var(--color-bg-card)' }}>
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>All Caught Up!</h2>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            You have no new payment links to import from Stripe.
          </p>
          {alreadyImported > 0 && (
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              ({alreadyImported} link{alreadyImported !== 1 ? 's' : ''} already imported)
            </p>
          )}
          <button
            onClick={() => router.push('/dashboard/payment-links')}
            className="px-6 py-2 rounded-lg transition"
            style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
          >
            ← Back to Payment Links
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Copied Toast Notification - Outside container for proper positioning */}
      {showCopiedToast && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }} className="animate-fade-in-down">
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-lg shadow-2xl"
            style={{ background: '#212437', border: '2px solid #50f5ac', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#50f5ac"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span className="font-medium" style={{ color: '#edeff8' }}>
              Copied!
            </span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Import Payment Links</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            You have <strong>{totalCount}</strong> payment link{totalCount !== 1 ? 's' : ''} available to import from Stripe
          </p>
          {alreadyImported > 0 && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              ({alreadyImported} already imported)
            </p>
          )}
        </div>
        <button
          onClick={() => router.push('/dashboard/payment-links')}
          className="px-4 py-2 rounded-lg transition"
          style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
        >
          Cancel
        </button>
      </div>

      {/* Your Domains */}
      <div className="rounded-lg shadow p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>🌐 Your Thank You Page URLs</h2>
        {domains.length > 0 ? (
          <div className="space-y-2">
            {domains.map((domain) => (
              <div
                key={domain.domain}
                className="group flex items-center justify-between px-4 py-3 rounded-lg transition"
                style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex-1">
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {domain.domain}
                  </p>
                  <p className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>
                    {domain.ty_page_url}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyUrl(domain.ty_page_url)}
                  className="ml-3 p-2 rounded-lg transition opacity-0 group-hover:opacity-100"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
                  title="Copy URL"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              No domains configured yet.
            </p>
            <a
              href="/dashboard/domains"
              className="text-sm hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Add a domain first →
            </a>
          </div>
        )}
      </div>

      {/* Payment Links Table */}
      <div className="card overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={linksWithUrls.every(l => l.selected)}
              onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              {linksWithUrls.filter(l => l.selected).length} of {totalCount} selected
            </span>
          </div>
          <div className="grid grid-cols-11 gap-4 flex-1 ml-6 font-semibold text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="col-span-3">Product Name</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-4">Thank You Page URL</div>
            <div className="col-span-2">Status</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {linksWithUrls.map((link, index) => (
            <div
              key={link.id}
              className="flex items-center gap-4 px-6 py-4 transition"
              style={{
                background: link.selected ? 'var(--color-bg-card)' : 'var(--color-bg-secondary)',
                opacity: link.selected ? 1 : 0.5
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={link.selected}
                onChange={() => handleToggleSelect(link.id)}
                className="w-4 h-4 cursor-pointer flex-shrink-0"
                style={{ accentColor: 'var(--color-accent)' }}
              />

              {/* Grid Columns */}
              <div className="grid grid-cols-11 gap-4 flex-1 items-center">
                {/* Product Name */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {link.product_name}
                    </span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs hover:underline block truncate"
                    style={{ color: 'var(--color-accent)' }}
                    title={link.url}
                  >
                    View Stripe Link →
                  </a>
                </div>

                {/* Amount */}
                <div className="col-span-2">
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-accent)' }}>
                    ${(link.amount / 100).toFixed(2)}
                  </span>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {link.currency.toUpperCase()}
                  </p>
                </div>

                {/* Thank You Page URL */}
                <div className="col-span-4">
                  {link.selected ? (
                    <div>
                      <input
                        type="url"
                        value={link.tyPageUrl}
                        onChange={(e) => handleUrlChange(link.id, e.target.value)}
                        placeholder="Paste your Thank You Page URL"
                        className="w-full px-3 py-1.5 rounded text-sm focus:ring-2 focus:outline-none"
                        style={{
                          background: 'var(--color-bg-secondary)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                      {link.existing_ty_page_url && (
                        <p className="text-xs mt-1 truncate" style={{ color: 'var(--color-text-secondary)' }} title={link.existing_ty_page_url}>
                          Current: {link.existing_ty_page_url}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {link.existing_ty_page_url ? (
                        <span className="truncate block" title={link.existing_ty_page_url}>{link.existing_ty_page_url}</span>
                      ) : (
                        '—'
                      )}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className="flex flex-wrap gap-1">
                    {link.active && (
                      <span className="px-2 py-1 text-xs rounded" style={{ background: 'rgba(80, 245, 172, 0.15)', color: 'var(--color-accent)' }}>
                        Active
                      </span>
                    )}
                    {link.existing_ty_page_url && (
                      <span className="px-2 py-1 text-xs rounded" style={{ background: 'rgba(80, 245, 172, 0.15)', color: 'var(--color-accent)' }}>
                        Has URL
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => router.push('/dashboard/payment-links')}
          className="px-6 py-3 rounded-lg transition"
          style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleProceedToImport}
          disabled={importing || linksWithUrls.filter(l => l.selected).length === 0}
          className="px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
        >
          {importing ? 'Importing...' : `Import ${linksWithUrls.filter(l => l.selected).length} Selected Link${linksWithUrls.filter(l => l.selected).length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="rounded-lg shadow-xl p-8 max-w-md w-full mx-4" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Confirm Import</h2>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              You are about to import <strong>{linksWithUrls.filter(l => l.selected).length}</strong> payment link{linksWithUrls.filter(l => l.selected).length !== 1 ? 's' : ''} from Stripe.
              Each link will be updated with the Thank You Page URL you provided.
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Are you sure you want to continue?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={importing}
                className="flex-1 px-4 py-2 rounded-lg transition"
                style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="flex-1 px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-accent)', color: 'var(--color-btn-primary-text)' }}
              >
                {importing ? 'Importing...' : 'Yes, Import'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
