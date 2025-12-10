import Link from 'next/link';

export default function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const isUrgent = daysLeft <= 3;

  return (
    <div
      className="mb-6 p-4 rounded-lg border-2"
      style={{
        backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        borderColor: isUrgent ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isUrgent ? '⚠️' : '🎉'}</span>
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {daysLeft === 0 ? 'Last day of trial!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in your trial`}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Upgrade now to continue using Ping after your trial ends
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="btn btn-primary px-6 py-2"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}
