import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';
import { isAdmin } from '@/lib/admin-auth';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is authenticated
  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Check if user is admin
  if (!isAdmin(user.id)) {
    redirect('/dashboard'); // Redirect non-admins to regular dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="text-2xl font-bold">⚡</div>
                <div className="ml-2">
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  <p className="text-xs text-purple-200">Ping It Now - System Admin</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">👤 {user.email}</span>
              <Link
                href="/dashboard"
                className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition text-sm"
              >
                Regular Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <nav className="p-4 space-y-1">
            <NavLink href="/admin/dashboard" icon="📊">
              Overview
            </NavLink>
            <NavLink href="/admin/clients" icon="👥">
              Clients
            </NavLink>
            <NavLink href="/admin/transactions" icon="💰">
              Transactions
            </NavLink>
            <NavLink href="/admin/subscriptions" icon="📅">
              Subscriptions
            </NavLink>
            <NavLink href="/admin/analytics" icon="📈">
              Analytics
            </NavLink>
            <NavLink href="/admin/payment-links" icon="🔗">
              Payment Links
            </NavLink>
            <NavLink href="/admin/domains" icon="🌐">
              Domains
            </NavLink>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <NavLink href="/admin/settings" icon="⚙️">
                Settings
              </NavLink>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition group"
    >
      <span className="text-xl group-hover:scale-110 transition">{icon}</span>
      <span className="font-medium text-gray-700 group-hover:text-gray-900">
        {children}
      </span>
    </Link>
  );
}
