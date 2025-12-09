import { getUser } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-purple-700">Payment Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
          >
            📊 Overview
          </Link>
          <Link
            href="/dashboard/settings"
            className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
          >
            ⚙️ Settings
          </Link>
          <Link
            href="/dashboard/payment-links"
            className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
          >
            🔗 Payment Links
          </Link>
          <Link
            href="/dashboard/checkouts"
            className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
          >
            💳 Checkouts
          </Link>
          <Link
            href="/dashboard/transactions"
            className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
          >
            📈 Transactions
          </Link>
          <Link
            href="/dashboard/domains"
            className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
          >
            🌐 Custom Domain
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
