import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get checkout sessions
    const { data: checkoutSessions, error } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ checkoutSessions });
  } catch (error: any) {
    console.error('Error fetching checkout sessions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, product_name, amount, currency } = body;

    if (!name || !product_name || !amount || !currency) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get or create tenant
    let { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant) {
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          clerk_user_id: user.id,
          email: user.email,
        })
        .select('id')
        .single();

      if (tenantError) throw tenantError;
      tenant = newTenant;
    }

    // Create checkout session config
    const { data: checkoutSession, error } = await supabase
      .from('checkout_sessions')
      .insert({
        tenant_id: tenant.id,
        name,
        product_name,
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ checkoutSession }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
