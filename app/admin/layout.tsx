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
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Admin Header */}
      <header className="shadow-lg" style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="text-2xl font-bold">⚡</div>
                <div className="ml-2">
                  <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Admin Dashboard</h1>
                  <p className="text-xs" style={{ color: 'var(--color-accent)' }}>Ping It Now - System Admin</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>👤 {user.email}</span>
              <Link
                href="/dashboard"
                className="px-3 py-1 rounded transition text-sm"
                style={{
                  background: 'var(--color-bg-hover)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)'
                }}
              >
                Regular Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 shadow-md min-h-screen" style={{ background: 'var(--color-bg-secondary)', borderRight: '1px solid var(--color-border)' }}>
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
      className="admin-nav-link flex items-center space-x-3 px-4 py-2 rounded-lg transition group"
    >
      <span className="text-xl group-hover:scale-110 transition">{icon}</span>
      <span className="font-medium">
        {children}
      </span>
    </Link>
  );
}
