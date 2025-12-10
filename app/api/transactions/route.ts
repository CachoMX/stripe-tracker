import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant) {
      return NextResponse.json({ transactions: [], stats: { totalRevenue: 0, totalTransactions: 0, avgTransaction: 0 } });
    }

    // Get transactions
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate stats
    const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const totalTransactions = transactions?.length || 0;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return NextResponse.json({
      transactions: transactions || [],
      stats: {
        totalRevenue,
        totalTransactions,
        avgTransaction,
      }
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
