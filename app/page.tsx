import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/ping-wordmark-dark.svg"
                alt="Ping"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Sign In
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/ping-icon-export.svg"
              alt="Ping"
              width={120}
              height={120}
              className="w-24 h-24 md:w-32 md:h-32"
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            Payment Tracking
            <br />
            <span style={{ color: 'var(--color-accent)' }}>Precision Refined</span>
          </h1>

          <p className="text-lg md:text-xl mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Track every Stripe payment with surgical precision. Multi-tenant SaaS platform
            with Hyros integration, custom domains, and real-time analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start Tracking Free
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg">
              See Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Everything You Need
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Powerful features for payment tracking and analytics
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Hyros Integration
            </h3>
            <p className="text-small">
              Seamlessly integrate your Hyros tracking script. Capture every conversion with precision.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Custom Domains
            </h3>
            <p className="text-small">
              Use your own domain for thank you pages. Automatic SSL and DNS management.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Stripe Native
            </h3>
            <p className="text-small">
              Works with Payment Links and Checkout Sessions. Track all your Stripe payments.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Real-time Analytics
            </h3>
            <p className="text-small">
              Live dashboard with revenue tracking, transaction counts, and detailed history.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Auto Redirect
            </h3>
            <p className="text-small">
              Configurable post-payment redirects. Send customers to your next funnel step.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Multi-Tenant
            </h3>
            <p className="text-small">
              Secure isolation. Each client gets their own dashboard and configuration.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="card text-center" style={{ background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 100%)' }}>
          <div className="max-w-2xl mx-auto py-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Ready to Track With Precision?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              Join hundreds of businesses tracking their Stripe payments with Ping.
            </p>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Company</h3>
              <div className="space-y-2">
                <Link href="/how-it-works" className="block text-sm hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                  How It Works
                </Link>
                <Link href="/#features" className="block text-sm hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                  Features
                </Link>
              </div>
            </div>

            {/* Account */}
            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Account</h3>
              <div className="space-y-2">
                <Link href="/login" className="block text-sm hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                  Sign In
                </Link>
                <Link href="/signup" className="block text-sm hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                  Sign Up
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Legal</h3>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-sm hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-sm hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                  Terms & Conditions
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Contact</h3>
              <div className="space-y-2">
                <a href="mailto:info@pingitnow.com" className="block text-sm hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                  info@pingitnow.com
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/ping-app-icon.svg"
                  alt="Ping"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  © 2025 Ping. Payment tracking precision refined.
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
