import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Require admin access
    requireAdmin(user?.id);

    // Get all tenants with custom domains
    const { data: tenants, error } = await supabaseAdmin
      .from('tenants')
      .select('id, email, custom_domain, subscription_plan, subscription_status, created_at')
      .not('custom_domain', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get stats for each domain
    const domainsWithStats = await Promise.all(
      (tenants || []).map(async (tenant) => {
        const { count: transactionCount } = await supabaseAdmin
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id);

        const { count: paymentLinkCount } = await supabaseAdmin
          .from('payment_links')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('active', true);

        return {
          ...tenant,
          stats: {
            transactions: transactionCount || 0,
            paymentLinks: paymentLinkCount || 0,
          },
        };
      })
    );

    return NextResponse.json({
      domains: domainsWithStats,
      total: domainsWithStats.length,
    });
  } catch (error: any) {
    console.error('Admin domains error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}
