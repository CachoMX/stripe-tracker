'use client';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Revenue analytics and growth metrics</p>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow p-8 text-white text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2">Advanced Analytics</h2>
        <p className="text-green-100">
          Revenue over time, growth charts, cohort analysis, churn rates, and predictive metrics
        </p>
        <p className="text-sm text-green-200 mt-4">Coming soon...</p>
      </div>
    </div>
  );
}
