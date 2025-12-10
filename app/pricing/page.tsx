'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for solo entrepreneurs and small stores',
    monthlyPrice: 29,
    features: [
      '1 Stripe account connection',
      'Unlimited payment links',
      'Up to 500 transactions/month',
      'Hyros tracking integration',
      'Basic dashboard analytics',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'For growing businesses and agencies',
    monthlyPrice: 79,
    features: [
      'Everything in Starter',
      'Up to 5,000 transactions/month',
      '1 custom domain',
      'Post-payment redirect',
      'Priority support',
      'Transaction export (CSV)',
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Business',
    description: 'For high-volume and enterprise needs',
    monthlyPrice: 199,
    features: [
      'Everything in Pro',
      'Unlimited transactions',
      '5 custom domains',
      'API access (coming soon)',
      'Dedicated support',
      'White-label options',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (monthlyPrice: number) => {
    if (isYearly) {
      // Yearly = 10 months (save 2 months)
      return monthlyPrice * 10;
    }
    return monthlyPrice;
  };

  const getSavings = (monthlyPrice: number) => {
    return monthlyPrice * 2;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image
                src="/images/ping-wordmark-dark.svg"
                alt="Ping"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/how-it-works" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
                How It Works
              </Link>
              <Link href="/login" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
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
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--color-text-secondary)' }}>
          Choose the plan that fits your business. Upgrade or downgrade anytime.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className="text-sm font-medium cursor-pointer"
            style={{ color: !isYearly ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            onClick={() => setIsYearly(false)}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 rounded-full transition-colors duration-200"
            style={{ backgroundColor: isYearly ? 'var(--color-accent)' : 'var(--color-border)' }}
          >
            <span
              className="absolute top-1 w-5 h-5 rounded-full transition-transform duration-200"
              style={{
                backgroundColor: 'white',
                transform: isYearly ? 'translateX(32px)' : 'translateX(4px)',
              }}
            />
          </button>
          <span
            className="text-sm font-medium cursor-pointer flex items-center gap-2"
            style={{ color: isYearly ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            onClick={() => setIsYearly(true)}
          >
            Yearly
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}
            >
              Save 2 months
            </span>
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="card relative flex flex-col"
              style={{
                border: plan.highlighted ? '2px solid var(--color-accent)' : undefined,
              }}
            >
              {plan.highlighted && (
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}
                >
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {plan.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    ${getPrice(plan.monthlyPrice)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>
                {isYearly && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-accent)' }}>
                    Save ${getSavings(plan.monthlyPrice)}/year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span style={{ color: 'var(--color-accent)' }}>✓</span>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`btn w-full text-center ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-20" style={{ borderTop: '1px solid var(--color-border)' }}>
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--color-text-primary)' }}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Can I change plans later?
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing.
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              What happens if I exceed my transaction limit?
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              We'll notify you when you're approaching your limit. You can upgrade to a higher plan or we'll simply pause tracking until the next billing cycle.
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Is there a free trial?
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Yes! All plans come with a 14-day free trial. No credit card required to start.
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              How do custom domains work?
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              With Pro and Business plans, you can use your own domain (e.g., ty.yourdomain.com) for thank you pages. We handle SSL certificates automatically.
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Do you offer refunds?
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 100%)' }}>
          <div className="py-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              Start your 14-day free trial today. No credit card required.
            </p>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
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
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                Privacy
              </Link>
              <Link href="/terms" className="text-sm hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
