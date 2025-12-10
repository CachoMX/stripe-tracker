import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { addDomainToVercel, verifyDomainInVercel } from '@/lib/vercel/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant with domain info
    const { data: tenant, error } = await supabaseAdmin
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

    // Add domain to Vercel
    try {
      await addDomainToVercel(custom_domain);
    } catch (vercelError: any) {
      console.error('Vercel domain addition error:', vercelError);
      // Continue even if Vercel fails - user can add manually
    }

    // Get or create tenant
    let { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id, custom_domain')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant) {
      const { data: newTenant, error: tenantError } = await supabaseAdmin
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
    const { error: updateError } = await supabaseAdmin
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
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id, custom_domain')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant || !tenant.custom_domain) {
      return NextResponse.json({ error: 'No domain configured' }, { status: 400 });
    }

    // Verify domain in Vercel
    let vercelVerified = false;
    try {
      const vercelResponse = await verifyDomainInVercel(tenant.custom_domain);
      console.log('Vercel verification response:', vercelResponse);
      vercelVerified = vercelResponse.verified;
    } catch (vercelError: any) {
      console.error('Vercel verification error:', vercelError);
      console.error('Error details:', vercelError.message, vercelError.stack);
      // If Vercel verification fails, we still allow manual verification
    }

    console.log('Final vercelVerified value:', vercelVerified);

    // Update tenant domain verification status
    const { error: updateError } = await supabaseAdmin
      .from('tenants')
      .update({
        domain_verified: vercelVerified,
      })
      .eq('id', tenant.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, domainVerified: vercelVerified });
  } catch (error: any) {
    console.error('Error verifying domain:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
