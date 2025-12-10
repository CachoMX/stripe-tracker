'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PaymentLink {
  id: string;
  tenant_id: string;
  name: string;
  stripe_payment_link: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useRealtimePaymentLinks(tenantId: string | null) {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
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
        .from('payment_links')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment links:', error);
      } else {
        setPaymentLinks(data || []);
      }
      setLoading(false);

      // Subscribe to real-time updates
      channel = supabase
        .channel(`payment_links:${tenantId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'payment_links',
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            setPaymentLinks((current) => [payload.new as PaymentLink, ...current]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'payment_links',
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            setPaymentLinks((current) =>
              current.map((link) =>
                link.id === payload.new.id ? (payload.new as PaymentLink) : link
              )
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'payment_links',
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            setPaymentLinks((current) =>
              current.filter((link) => link.id !== payload.old.id)
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

  return { paymentLinks, loading };
}
