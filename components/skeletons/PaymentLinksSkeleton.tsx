export default function PaymentLinksSkeleton() {
  return (
    <div className="card">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="ml-4">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>

            {/* Analytics Stats Skeleton */}
            <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                <div className="h-3 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
              <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                <div className="h-3 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
