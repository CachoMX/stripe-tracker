'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  timestamp: number;
}

export default function RealtimeNotifications({ tenantId }: { tenantId: string | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel(`notifications:${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload: any) => {
          const transaction = payload.new;
          const notification: Notification = {
            id: crypto.randomUUID(),
            message: `New transaction: $${(transaction.amount / 100).toFixed(2)} from ${transaction.customer_email}`,
            type: 'success',
            timestamp: Date.now(),
          };

          setNotifications((prev) => [notification, ...prev].slice(0, 5));

          // Auto-remove after 5 seconds
          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="animate-slide-in bg-white rounded-lg shadow-lg p-4 max-w-sm border-l-4"
          style={{
            borderLeftColor: notification.type === 'success' ? 'var(--color-success)' : 'var(--color-accent)',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' && (
                <div className="text-2xl">✅</div>
              )}
              {notification.type === 'info' && (
                <div className="text-2xl">ℹ️</div>
              )}
              {notification.type === 'warning' && (
                <div className="text-2xl">⚠️</div>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() =>
                setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
              }
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
