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
    const period = searchParams.get('period') || '30'; // days

    // Get transactions for the period
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('amount, created_at, tenant_id')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Group by date
    const revenueByDate: { [key: string]: number } = {};
    const transactionsByDate: { [key: string]: number } = {};

    transactions?.forEach((t) => {
      const date = new Date(t.created_at).toISOString().split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + (t.amount / 100);
      transactionsByDate[date] = (transactionsByDate[date] || 0) + 1;
    });

    // Format for chart
    const chartData = Object.keys(revenueByDate).map((date) => ({
      date,
      revenue: Math.round(revenueByDate[date] * 100) / 100,
      transactions: transactionsByDate[date],
    }));

    // Get client growth data
    const { data: tenants } = await supabaseAdmin
      .from('tenants')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    const clientsByDate: { [key: string]: number } = {};
    tenants?.forEach((t) => {
      const date = new Date(t.created_at).toISOString().split('T')[0];
      clientsByDate[date] = (clientsByDate[date] || 0) + 1;
    });

    const clientGrowthData = Object.keys(clientsByDate).map((date) => ({
      date,
      newClients: clientsByDate[date],
    }));

    // Calculate summary metrics
    const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalTransactions = transactions?.length || 0;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Get top clients by revenue
    const revenueByClient: { [key: string]: number } = {};
    transactions?.forEach((t) => {
      revenueByClient[t.tenant_id] = (revenueByClient[t.tenant_id] || 0) + t.amount;
    });

    const topClientIds = Object.entries(revenueByClient)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id);

    const { data: topClients } = await supabaseAdmin
      .from('tenants')
      .select('id, email, subscription_plan')
      .in('id', topClientIds);

    const topClientsWithRevenue = topClients?.map((client) => ({
      ...client,
      revenue: revenueByClient[client.id] / 100,
    })) || [];

    return NextResponse.json({
      revenueChart: chartData,
      clientGrowth: clientGrowthData,
      summary: {
        totalRevenue: totalRevenue / 100,
        totalTransactions,
        averageTransactionValue: averageTransactionValue / 100,
      },
      topClients: topClientsWithRevenue,
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
