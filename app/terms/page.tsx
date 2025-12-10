import Link from 'next/link';
import Image from 'next/image';

export default function TermsPage() {
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
          Terms and Conditions
        </h1>

        <div className="space-y-8" style={{ color: 'var(--color-text-secondary)', fontSize: '16px', lineHeight: '1.8' }}>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>1. Agreement to Terms</h2>
            <p>
              By accessing or using Ping ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of these Terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>2. Description of Service</h2>
            <p>
              Ping is a multi-tenant SaaS platform that provides payment tracking and analytics for Stripe payment links and checkout sessions. The Service includes:
            </p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Payment link management and tracking</li>
              <li>Transaction analytics and reporting</li>
              <li>Custom domain configuration for thank you pages</li>
              <li>Third-party tracking script integration (e.g., Hyros)</li>
              <li>Automated redirect functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>3. Account Registration</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>3.1 Account Creation</h3>
            <p>
              To use the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>3.2 Account Security</h3>
            <p>
              You are responsible for safeguarding your password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>3.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>4. Acceptable Use</h2>
            <p>You agree NOT to use the Service to:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Transmit any harmful, threatening, abusive, or fraudulent content</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Transmit viruses, malware, or other malicious code</li>
              <li>Collect or harvest personal information without consent</li>
              <li>Use automated systems to access the Service without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>5. Stripe Integration</h2>
            <p>
              The Service integrates with Stripe for payment processing. You acknowledge and agree that:
            </p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>You must have a valid Stripe account to use the Service</li>
              <li>You are responsible for maintaining your Stripe API keys securely</li>
              <li>Stripe's Terms of Service apply to all payment processing</li>
              <li>We are not responsible for Stripe's services, fees, or policies</li>
              <li>You comply with all applicable payment card industry regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>6. Intellectual Property</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>6.1 Our Rights</h3>
            <p>
              The Service and its original content, features, and functionality are owned by Ping and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>6.2 Your Rights</h3>
            <p>
              You retain all rights to any content you submit, post, or display on or through the Service. By using the Service, you grant us a limited, worldwide, non-exclusive license to use, store, and display your content solely for the purpose of providing the Service.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>6.3 Restrictions</h3>
            <p>
              You may not copy, modify, distribute, sell, or lease any part of our Service or included software, nor may you reverse engineer or attempt to extract the source code of that software.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>7. Payment and Fees</h2>
            <p>
              Pricing for the Service is available on our website. You agree to pay all fees associated with your use of the Service. We reserve the right to change our fees at any time, with notice provided to you.
            </p>
            <p className="mt-4">
              All fees are non-refundable unless otherwise stated or required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>8. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy. We collect and use information in accordance with our Privacy Policy, available at <Link href="/privacy" style={{ color: 'var(--color-accent)' }}>/privacy</Link>.
            </p>
            <p className="mt-4">
              You acknowledge that you are responsible for ensuring your use of the Service complies with all applicable data protection and privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>9. Disclaimers and Limitations</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>9.1 Service "As Is"</h3>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>9.2 No Guarantee</h3>
            <p>
              We do not warrant that the Service will be uninterrupted, timely, secure, or error-free. We do not guarantee the accuracy, completeness, or reliability of any content or data.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>9.3 Third-Party Services</h3>
            <p>
              The Service may contain links to third-party websites or services (including Stripe and tracking platforms). We are not responsible for the content, privacy policies, or practices of any third-party sites or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL PING, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
            <p className="mt-4">
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS BEFORE THE EVENT GIVING RISE TO THE LIABILITY.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Ping and its officers, directors, employees, contractors, agents, licensors, and suppliers from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with:
            </p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Your access to or use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party right, including any intellectual property or privacy right</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>12. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
            <p className="mt-4">
              Any dispute arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You agree to waive any right to a jury trial or to participate in a class action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>13. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="mt-4">
              By continuing to access or use our Service after revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>14. Severability</h2>
            <p>
              If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>15. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Ping regarding the use of the Service and supersede all prior and contemporaneous written or oral agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>16. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us:
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
