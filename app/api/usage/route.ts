import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getTenantUsage } from '@/lib/transaction-limits';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant by user id
    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .select('id, subscription_plan, subscription_status')
      .eq('clerk_user_id', user.id)
      .single();

    if (error || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get usage stats
    const usage = await getTenantUsage(tenant.id);

    if (!usage) {
      return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
    }

    return NextResponse.json({
      usage,
      plan: tenant.subscription_plan,
      status: tenant.subscription_status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
