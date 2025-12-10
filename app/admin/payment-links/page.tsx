'use client';

export default function AdminPaymentLinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Links</h1>
        <p className="text-gray-500 mt-1">View all payment links across all clients</p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow p-8 text-white text-center">
        <div className="text-6xl mb-4">🔗</div>
        <h2 className="text-2xl font-bold mb-2">Payment Links Dashboard</h2>
        <p className="text-blue-100">
          Global view of all payment links with filtering by client, status, and performance metrics
        </p>
        <p className="text-sm text-blue-200 mt-4">Coming soon...</p>
      </div>
    </div>
  );
}
