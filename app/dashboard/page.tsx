import { getUser } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/server';

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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome back!
      </p>

      {!isConfigured && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Setup Required:</strong> Please configure your Stripe keys and Hyros tracking script in{' '}
                <a href="/dashboard/settings" className="font-medium underline">Settings</a> to get started.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{transactionCount || 0}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Payment Links</p>
              <p className="text-3xl font-bold text-gray-900">{paymentLinksCount || 0}</p>
            </div>
            <div className="text-4xl">🔗</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {isConfigured ? (
                  <span className="text-green-600">✓ Configured</span>
                ) : (
                  <span className="text-yellow-600">⚠ Setup Needed</span>
                )}
              </p>
            </div>
            <div className="text-4xl">{isConfigured ? '✅' : '⚙️'}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/dashboard/settings"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <div className="text-3xl mr-4">⚙️</div>
            <div>
              <h3 className="font-semibold text-gray-900">Configure Settings</h3>
              <p className="text-sm text-gray-600">Add your Stripe keys and Hyros script</p>
            </div>
          </a>

          <a
            href="/dashboard/payment-links"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <div className="text-3xl mr-4">🔗</div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Payment Link</h3>
              <p className="text-sm text-gray-600">Generate a new Stripe payment link</p>
            </div>
          </a>

          <a
            href="/dashboard/domains"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <div className="text-3xl mr-4">🌐</div>
            <div>
              <h3 className="font-semibold text-gray-900">Setup Custom Domain</h3>
              <p className="text-sm text-gray-600">Configure your thank you page domain</p>
            </div>
          </a>

          <a
            href="/dashboard/transactions"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h3 className="font-semibold text-gray-900">View Transactions</h3>
              <p className="text-sm text-gray-600">See all your payment history</p>
            </div>
          </a>
        </div>
      </div>

      {tenant?.custom_domain && (
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
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
