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

    // Get global statistics
    const [
      tenantsResult,
      activeTenantsResult,
      transactionsResult,
      revenueResult,
      paymentLinksResult,
      domainsResult,
    ] = await Promise.all([
      // Total clients
      supabaseAdmin
        .from('tenants')
        .select('*', { count: 'exact', head: true }),

      // Active clients (with active subscriptions)
      supabaseAdmin
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active'),

      // Total transactions (last 30 days)
      supabaseAdmin
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

      // Total revenue (all time)
      supabaseAdmin
        .from('transactions')
        .select('amount'),

      // Total payment links
      supabaseAdmin
        .from('payment_links')
        .select('*', { count: 'exact', head: true })
        .eq('active', true),

      // Total custom domains
      supabaseAdmin
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .not('custom_domain', 'is', null),
    ]);

    // Calculate total revenue
    const totalRevenue = revenueResult.data?.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    ) || 0;

    // Get recent transactions (last 7 days) for growth calculation
    const { data: recentTransactions } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const recentRevenue = recentTransactions?.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    ) || 0;

    // Get previous week revenue for comparison
    const { data: previousWeekTransactions } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const previousWeekRevenue = previousWeekTransactions?.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    ) || 0;

    // Calculate growth percentage
    const revenueGrowth = previousWeekRevenue > 0
      ? ((recentRevenue - previousWeekRevenue) / previousWeekRevenue) * 100
      : 0;

    return NextResponse.json({
      totalClients: tenantsResult.count || 0,
      activeClients: activeTenantsResult.count || 0,
      transactionsLast30Days: transactionsResult.count || 0,
      totalRevenue: totalRevenue / 100, // Convert cents to dollars
      recentRevenue: recentRevenue / 100,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10, // Round to 1 decimal
      activePaymentLinks: paymentLinksResult.count || 0,
      customDomains: domainsResult.count || 0,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
