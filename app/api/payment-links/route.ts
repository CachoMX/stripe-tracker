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

    // Get payment links
    const { data: paymentLinks, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ paymentLinks });
  } catch (error: any) {
    console.error('Error fetching payment links:', error);
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
    const { name, stripe_payment_link } = body;

    if (!name || !stripe_payment_link) {
      return NextResponse.json(
        { error: 'Name and stripe_payment_link are required' },
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

    // Create payment link
    const { data: paymentLink, error } = await supabase
      .from('payment_links')
      .insert({
        tenant_id: tenant.id,
        name,
        stripe_payment_link,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ paymentLink }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
