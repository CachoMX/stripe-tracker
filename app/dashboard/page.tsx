import { getUser } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) return null;

  // Get or create tenant
  let { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('clerk_user_id', user.id)
    .single();

  // Create tenant if doesn't exist
  if (!tenant) {
    const { data: newTenant } = await supabaseAdmin
      .from('tenants')
      .insert({
        clerk_user_id: user.id,
        email: user.email || '',
      })
      .select()
      .single();

    tenant = newTenant;
  }

  // Get transaction count
  const { count: transactionCount } = await supabaseAdmin
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant?.id || '');

  // Get payment links count
  const { count: paymentLinksCount } = await supabaseAdmin
    .from('payment_links')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant?.id || '');

  const isConfigured = !!(tenant?.stripe_secret_key && tenant?.hyros_tracking_script);

  return (
    <div>
      <h1 className="text-h1">Dashboard</h1>
      <p className="text-secondary mb-8">
        Welcome back!
      </p>

      {!isConfigured && (
        <div className="alert alert-warning">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <strong>Setup Required:</strong> Please configure your Stripe keys and Hyros tracking script in{' '}
                <a href="/dashboard/settings" className="font-medium underline">Settings</a> to get started.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-small mb-1">Total Transactions</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{transactionCount || 0}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-small mb-1">Payment Links</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{paymentLinksCount || 0}</p>
            </div>
            <div className="text-4xl">🔗</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-small mb-1">Status</p>
              <p className="text-lg font-semibold">
                {isConfigured ? (
                  <span className="text-success">✓ Configured</span>
                ) : (
                  <span className="text-warning">⚠ Setup Needed</span>
                )}
              </p>
            </div>
            <div className="text-4xl">{isConfigured ? '✅' : '⚙️'}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-h2">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/dashboard/settings" className="quick-action-link">
            <div className="text-3xl mr-4">⚙️</div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Configure Settings</h3>
              <p className="text-small">Add your Stripe keys and Hyros script</p>
            </div>
          </a>

          <a href="/dashboard/payment-links" className="quick-action-link">
            <div className="text-3xl mr-4">🔗</div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Create Payment Link</h3>
              <p className="text-small">Generate a new Stripe payment link</p>
            </div>
          </a>

          <a href="/dashboard/domains" className="quick-action-link">
            <div className="text-3xl mr-4">🌐</div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Setup Custom Domain</h3>
              <p className="text-small">Configure your thank you page domain</p>
            </div>
          </a>

          <a href="/dashboard/transactions" className="quick-action-link">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>View Transactions</h3>
              <p className="text-small">See all your payment history</p>
            </div>
          </a>
        </div>
      </div>

      {tenant?.custom_domain && (
        <div className="alert alert-info mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                Your custom domain: <strong>{tenant.custom_domain}</strong>
                {tenant.domain_verified ? ' ✓ Verified' : ' ⚠ Pending verification'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
