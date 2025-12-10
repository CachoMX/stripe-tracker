import { getUser } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';
import ThemeToggle from '@/app/components/ThemeToggle';
import { getOrCreateTenant, hasAccess, getDaysLeftInTrial, isTrialActive } from '@/lib/tenant-helpers';
import TrialBanner from '@/components/TrialBanner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Get or create tenant with trial
  const tenant = await getOrCreateTenant(user.id, user.email);

  // Check if user has access (trial or paid)
  if (!hasAccess(tenant)) {
    redirect('/pricing?expired=true');
  }

  const showTrialBanner = isTrialActive(tenant);
  const daysLeft = getDaysLeftInTrial(tenant);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Sidebar */}
      <aside className="sidebar fixed left-0 top-0 h-full w-64 p-6">
        <div className="mb-8">
          <Link href="/" className="flex items-center mb-2">
            <Image
              src="/images/ping-wordmark-dark.svg"
              alt="Ping"
              width={120}
              height={36}
              className="h-9 w-auto"
            />
          </Link>
          <p className="text-small mt-1">{user.email}</p>
        </div>

        <nav className="space-y-2">
          <Link href="/dashboard" className="sidebar-nav-link">
            📊 Overview
          </Link>
          <Link href="/dashboard/settings" className="sidebar-nav-link">
            ⚙️ Settings
          </Link>
          <Link href="/dashboard/payment-links" className="sidebar-nav-link">
            🔗 Payment Links
          </Link>
          <Link href="/dashboard/checkouts" className="sidebar-nav-link">
            💳 Checkouts
          </Link>
          <Link href="/dashboard/transactions" className="sidebar-nav-link">
            📈 Transactions
          </Link>
          <Link href="/dashboard/domains" className="sidebar-nav-link">
            🌐 Custom Domain
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 flex gap-2 items-center">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content ml-64 p-8">
        {showTrialBanner && <TrialBanner daysLeft={daysLeft} />}
        {children}
      </main>
    </div>
  );
}
