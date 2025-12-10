import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Require admin access
    requireAdmin(user?.id);

    // Fetch all tenants with subscription data
    const { data: subscriptions, error } = await supabaseAdmin
      .from('tenants')
      .select('id, clerk_user_id, email, subscription_status, subscription_plan, stripe_subscription_id, current_period_end, trial_ends_at, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate stats
    const active = subscriptions?.filter((s) => s.subscription_status === 'active').length || 0;
    const trial = subscriptions?.filter((s) => !s.subscription_status && s.trial_ends_at).length || 0;
    const inactive = subscriptions?.filter((s) => !s.subscription_status && !s.trial_ends_at).length || 0;

    // Count by plan (using your actual plan names)
    const starter = subscriptions?.filter((s) => s.subscription_plan && (s.subscription_plan.toLowerCase().includes('starter') || s.subscription_plan.toLowerCase().includes('basic'))).length || 0;
    const pro = subscriptions?.filter((s) => s.subscription_plan && s.subscription_plan.toLowerCase().includes('pro')).length || 0;
    const business = subscriptions?.filter((s) => s.subscription_plan && (s.subscription_plan.toLowerCase().includes('business') || s.subscription_plan.toLowerCase().includes('enterprise'))).length || 0;

    // Calculate MRR (Monthly Recurring Revenue) - $29/month based on your pricing
    const totalMRR = active * 29; // All active subscriptions are $29/month

    const stats = {
      active,
      trial,
      inactive,
      totalMRR,
      byPlan: {
        starter,
        pro,
        business,
      },
    };

    return NextResponse.json({
      subscriptions: subscriptions || [],
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching admin subscriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
