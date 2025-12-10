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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const plan = searchParams.get('plan') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = supabaseAdmin
      .from('tenants')
      .select('*');

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,custom_domain.ilike.%${search}%`);
    }

    // Apply status filter
    if (status !== 'all') {
      if (status === 'active') {
        query = query.eq('subscription_status', 'active');
      } else if (status === 'trial') {
        query = query.is('subscription_status', null);
      } else if (status === 'expired') {
        query = query.in('subscription_status', ['canceled', 'unpaid', 'past_due']);
      }
    }

    // Apply plan filter
    if (plan !== 'all') {
      query = query.eq('subscription_plan', plan);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: tenants, error } = await query;

    if (error) {
      throw error;
    }

    // Get transaction counts for each tenant
    const tenantsWithStats = await Promise.all(
      (tenants || []).map(async (tenant) => {
        const { count: transactionCount } = await supabaseAdmin
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id);

        const { count: paymentLinkCount } = await supabaseAdmin
          .from('payment_links')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id);

        const { data: revenue } = await supabaseAdmin
          .from('transactions')
          .select('amount')
          .eq('tenant_id', tenant.id);

        const totalRevenue = revenue?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        return {
          ...tenant,
          stats: {
            transactions: transactionCount || 0,
            paymentLinks: paymentLinkCount || 0,
            revenue: totalRevenue / 100, // Convert cents to dollars
          },
        };
      })
    );

    return NextResponse.json({
      clients: tenantsWithStats,
      total: tenantsWithStats.length,
    });
  } catch (error: any) {
    console.error('Admin clients error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}
