import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant with domain info
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('custom_domain, domain_verified')
      .eq('clerk_user_id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      customDomain: tenant?.custom_domain || '',
      domainVerified: tenant?.domain_verified || false
    });
  } catch (error: any) {
    console.error('Error fetching domain:', error);
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
    const { custom_domain } = body;

    if (!custom_domain) {
      return NextResponse.json(
        { error: 'Custom domain is required' },
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
          custom_domain,
          domain_verified: false,
        })
        .select('id')
        .single();

      if (tenantError) throw tenantError;
      return NextResponse.json({ success: true, domainVerified: false });
    }

    // Update tenant domain
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        custom_domain,
        domain_verified: false,
      })
      .eq('id', tenant.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, domainVerified: false });
  } catch (error: any) {
    console.error('Error saving domain:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, custom_domain')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant || !tenant.custom_domain) {
      return NextResponse.json({ error: 'No domain configured' }, { status: 400 });
    }

    // TODO: In production, verify DNS records here
    // For now, we'll just mark it as verified
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        domain_verified: true,
      })
      .eq('id', tenant.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, domainVerified: true });
  } catch (error: any) {
    console.error('Error verifying domain:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
