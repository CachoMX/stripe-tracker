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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    let query = supabaseAdmin
      .from('transactions')
      .select(`
        *,
        tenants!inner(email, custom_domain)
      `);

    // Apply filters
    if (clientId) {
      query = query.eq('tenant_id', clientId);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    if (minAmount) {
      query = query.gte('amount', parseInt(minAmount) * 100); // Convert to cents
    }

    if (maxAmount) {
      query = query.lte('amount', parseInt(maxAmount) * 100); // Convert to cents
    }

    // Apply sorting and limit
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .limit(limit);

    const { data: transactions, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate summary stats
    const totalAmount = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const averageAmount = transactions && transactions.length > 0
      ? totalAmount / transactions.length
      : 0;

    return NextResponse.json({
      transactions: transactions || [],
      total: transactions?.length || 0,
      summary: {
        totalAmount: totalAmount / 100, // Convert to dollars
        averageAmount: averageAmount / 100,
        count: transactions?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Admin transactions error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
