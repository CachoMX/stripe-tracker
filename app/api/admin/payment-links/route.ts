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
    const clientId = searchParams.get('client');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const search = searchParams.get('search') || '';

    // Build query
    let query = supabaseAdmin
      .from('payment_links')
      .select(`
        *,
        tenants!inner(email, custom_domain, subscription_plan)
      `);

    // Apply filters
    if (clientId) {
      query = query.eq('tenant_id', clientId);
    }

    if (activeOnly) {
      query = query.eq('active', true);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Sort by created date
    query = query.order('created_at', { ascending: false });

    const { data: paymentLinks, error } = await query;

    if (error) {
      throw error;
    }

    // Get transaction stats for each payment link
    const linksWithStats = await Promise.all(
      (paymentLinks || []).map(async (link) => {
        const { data: transactions } = await supabaseAdmin
          .from('transactions')
          .select('amount')
          .eq('payment_link_id', link.id);

        const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        const totalSales = transactions?.length || 0;

        return {
          ...link,
          stats: {
            totalRevenue: totalRevenue / 100,
            totalSales,
          },
        };
      })
    );

    // Calculate summary
    const totalRevenue = linksWithStats.reduce((sum, link) => sum + link.stats.totalRevenue, 0);
    const totalSales = linksWithStats.reduce((sum, link) => sum + link.stats.totalSales, 0);
    const activeLinks = linksWithStats.filter(link => link.active).length;

    return NextResponse.json({
      paymentLinks: linksWithStats,
      total: linksWithStats.length,
      summary: {
        totalRevenue,
        totalSales,
        activeLinks,
        inactiveLinks: linksWithStats.length - activeLinks,
      },
    });
  } catch (error: any) {
    console.error('Admin payment links error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch payment links' },
      { status: 500 }
    );
  }
}
