'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Transaction {
  id: string;
  tenant_id: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string;
  customer_email: string;
  customer_name: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_link_id: string | null;
  metadata: any;
  created_at: string;
}

export function useRealtimeTransactions(tenantId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel;

    async function setupRealtimeSubscription() {
      // Initial fetch
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);

      // Subscribe to real-time updates
      channel = supabase
        .channel(`transactions:${tenantId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            setTransactions((current) => [payload.new as Transaction, ...current]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'transactions',
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            setTransactions((current) =>
              current.map((t) =>
                t.id === payload.new.id ? (payload.new as Transaction) : t
              )
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'transactions',
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            setTransactions((current) =>
              current.filter((t) => t.id !== payload.old.id)
            );
          }
        )
        .subscribe();
    }

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tenantId]);

  return { transactions, loading };
}
