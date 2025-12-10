'use client';

export default function AdminDomainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Custom Domains</h1>
        <p className="text-gray-500 mt-1">Manage custom domains across all clients</p>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow p-8 text-white text-center">
        <div className="text-6xl mb-4">🌐</div>
        <h2 className="text-2xl font-bold mb-2">Domain Management</h2>
        <p className="text-purple-100">
          View and manage all custom domains, SSL certificates, and DNS configurations
        </p>
        <p className="text-sm text-purple-200 mt-4">Coming soon...</p>
      </div>
    </div>
  );
}
