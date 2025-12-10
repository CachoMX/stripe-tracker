import Link from 'next/link';
import Image from 'next/image';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/ping-wordmark-dark.svg"
                alt="Ping"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
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

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          How Ping Works
        </h1>
        <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Track every Stripe payment with surgical precision in 3 simple steps
        </p>
      </section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="space-y-16">

          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}>
                <span className="text-2xl font-bold">1</span>
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Connect Your Stripe Account
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Click "Connect with Stripe" and authorize Ping in seconds. No API keys to copy, no manual setup - just a secure OAuth connection.
              </p>
              <ul className="space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>One-click OAuth authentication</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Secure, industry-standard connection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Revocable access anytime</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="card p-8 text-center">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Stripe Connect</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Secure OAuth connection</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded" style={{ backgroundColor: '#635BFF', color: 'white' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                  </svg>
                  <span className="text-sm font-semibold">Connect with Stripe</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="card p-8 text-center">
                <div className="text-6xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Payment Links</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Create and manage tracked links</p>
                <div className="text-left space-y-2">
                  <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Premium Plan</span>
                    <span className="text-xs" style={{ color: 'var(--color-accent)' }}>$2,450</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>VIP Package</span>
                    <span className="text-xs" style={{ color: 'var(--color-accent)' }}>$5,200</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}>
                <span className="text-2xl font-bold">2</span>
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Create & Track Payment Links
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Add your Stripe payment links to Ping. Each link is automatically tracked with real-time analytics showing revenue, sales count, and customer data.
              </p>
              <ul className="space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Revenue tracking per payment link</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Total sales and conversion metrics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Rename and organize your links</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}>
                <span className="text-2xl font-bold">3</span>
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Customize Thank You Pages
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Configure custom thank you pages with your branding, tracking scripts (Hyros, Google Analytics), and automatic redirects to maximize conversions.
              </p>
              <ul className="space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Custom domain support (ty.yourdomain.com)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Third-party tracking script injection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Automatic redirect with countdown timer</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Email capture and display</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="card p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Thank You Page</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Customized for your brand</p>
                <div className="p-4 rounded text-left" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>✓ Payment confirmed</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>customer@email.com</p>
                  <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-accent)' }}>
                    <p className="text-sm font-semibold">Redirecting in 5...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20" style={{ borderTop: '1px solid var(--color-border)' }}>
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--color-text-primary)' }}>
          Powerful Features Included
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Real-Time Analytics</h3>
            <p className="text-small">Track revenue, transactions, and customer data instantly</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Custom Domains</h3>
            <p className="text-small">Use your own domain for professional thank you pages</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Hyros Integration</h3>
            <p className="text-small">Inject tracking scripts for advanced attribution</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Auto Redirects</h3>
            <p className="text-small">Redirect customers after payment with countdown</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Multi-Tenant</h3>
            <p className="text-small">Completely isolated data for each account</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Email Capture</h3>
            <p className="text-small">Automatically capture and display customer emails</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Ready to Track Your Payments?
        </h2>
        <p className="text-xl mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Get started with Ping today and gain complete visibility into your Stripe payments
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn btn-primary btn-lg">
            Start Free Trial
          </Link>
          <Link href="/" className="btn btn-secondary btn-lg">
            View Pricing
          </Link>
        </div>
      </section>

      {/* Back to Home */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <Link href="/" className="text-sm" style={{ color: 'var(--color-accent)' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
