import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold text-white">Payment Tracker</h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-white hover:text-purple-200 transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-white text-purple-700 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center text-white max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Track Every Stripe Payment
            <span className="block text-purple-300">with Hyros Integration</span>
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-purple-100">
            The multi-tenant SaaS platform that captures customer emails from Stripe and sends them to Hyros automatically.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/signup"
              className="bg-white text-purple-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="#features"
              className="bg-purple-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-400 transition"
            >
              Learn More
            </Link>
          </div>

          {/* Features Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Hyros Tracking</h3>
              <p className="text-purple-100">
                Automatically inject your Hyros tracking script on thank you pages
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-3">Custom Domains</h3>
              <p className="text-purple-100">
                Use your own domain for thank you pages (ty.yourdomain.com)
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-3">Stripe Integration</h3>
              <p className="text-purple-100">
                Create payment links and checkout sessions directly from your dashboard
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Analytics</h3>
              <p className="text-purple-100">
                Track all your transactions and customer data in one place
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Instant Setup</h3>
              <p className="text-purple-100">
                Get started in minutes with our simple configuration
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Secure</h3>
              <p className="text-purple-100">
                Your Stripe keys are encrypted and stored securely
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
