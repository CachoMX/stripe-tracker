import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPolicyPage() {
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
          Privacy Policy
        </h1>

        <div className="space-y-8" style={{ color: 'var(--color-text-secondary)', fontSize: '16px', lineHeight: '1.8' }}>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>1. Introduction</h2>
            <p>
              Ping ("we," "our," or "us") operates www.pingitnow.com (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>2.1 Information You Provide</h3>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, password, and profile information</li>
              <li><strong>Payment Information:</strong> Stripe API keys and payment link URLs (we do not store credit card information)</li>
              <li><strong>Transaction Data:</strong> Customer emails, transaction amounts, and payment metadata</li>
              <li><strong>Configuration Data:</strong> Custom domain settings, tracking scripts, and redirect preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>2.2 Automatically Collected Information</h3>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Usage Data:</strong> IP addresses, browser type, device information, and pages visited</li>
              <li><strong>Cookies:</strong> Authentication tokens and session data</li>
              <li><strong>Analytics:</strong> Service usage patterns and performance metrics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>To provide and maintain the Service</li>
              <li>To process and track Stripe payment transactions</li>
              <li>To send transactional emails and service notifications</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To detect and prevent fraud, abuse, and security incidents</li>
              <li>To improve and optimize our Service</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>4. Data Sharing and Disclosure</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>4.1 Third-Party Service Providers</h3>
            <p>We may share your information with trusted third-party service providers:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li><strong>Stripe:</strong> For payment processing and transaction tracking</li>
              <li><strong>Supabase:</strong> For database hosting and authentication</li>
              <li><strong>Vercel:</strong> For application hosting and deployment</li>
              <li><strong>Tracking Platforms:</strong> If you enable third-party tracking scripts (e.g., Hyros)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>4.2 Legal Requirements</h3>
            <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).</p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>4.3 Business Transfers</h3>
            <p>If Ping is involved in a merger, acquisition, or asset sale, your information may be transferred. We will provide notice before your information is transferred and becomes subject to a different Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p className="mt-4">Security measures include:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Encrypted data transmission (HTTPS/SSL)</li>
              <li>Secure authentication via Supabase Auth</li>
              <li>Multi-tenant data isolation</li>
              <li>Regular security updates and monitoring</li>
              <li>Restricted access to personal information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>6. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us at <a href="mailto:info@pingitnow.com" style={{ color: 'var(--color-accent)' }}>info@pingitnow.com</a>.
            </p>
            <p className="mt-4">
              We may retain certain information after account deletion as required by law, for legitimate business purposes, or to resolve disputes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>7. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at <a href="mailto:info@pingitnow.com" style={{ color: 'var(--color-accent)' }}>info@pingitnow.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Service, you consent to such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>9. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>10. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>11. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none ml-0 space-y-2 mt-4">
              <li><strong>Email:</strong> <a href="mailto:info@pingitnow.com" style={{ color: 'var(--color-accent)' }}>info@pingitnow.com</a></li>
              <li><strong>Website:</strong> <a href="https://www.pingitnow.com" style={{ color: 'var(--color-accent)' }}>www.pingitnow.com</a></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--color-border)' }}>
          <Link href="/" className="text-sm" style={{ color: 'var(--color-accent)' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
