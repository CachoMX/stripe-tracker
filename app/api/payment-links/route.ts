import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

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
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get payment links
    const { data: paymentLinks, error } = await supabaseAdmin
      .from('payment_links')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get transaction stats for each payment link
    const linksWithStats = await Promise.all(
      (paymentLinks || []).map(async (link) => {
        const { data: transactions } = await supabaseAdmin
          .from('transactions')
          .select('amount')
          .eq('payment_link_id', link.id)
          .eq('tenant_id', tenant.id);

        const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        const totalSales = transactions?.length || 0;

        return {
          ...link,
          stats: {
            totalRevenue,
            totalSales,
          },
        };
      })
    );

    return NextResponse.json({ paymentLinks: linksWithStats });
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
    const { name, product_name, amount, currency = 'usd', description } = body;

    if (!name || !product_name || !amount) {
      return NextResponse.json(
        { error: 'Name, product_name, and amount are required' },
        { status: 400 }
      );
    }

    // Get or create tenant
    let { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id, stripe_secret_key, custom_domain, domain_verified')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant) {
      const { data: newTenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .insert({
          clerk_user_id: user.id,
          email: user.email,
        })
        .select('id, stripe_secret_key, custom_domain, domain_verified')
        .single();

      if (tenantError) throw tenantError;
      tenant = newTenant;
    }

    // Check if Stripe is connected
    if (!tenant.stripe_secret_key) {
      return NextResponse.json(
        { error: 'Please connect your Stripe account first in Settings' },
        { status: 400 }
      );
    }

    // Initialize Stripe with tenant's OAuth access token
    const stripe = new Stripe(tenant.stripe_secret_key, {
      apiVersion: '2025-11-17.clover',
    });

    // Convert amount to cents
    const amountInCents = Math.round(parseFloat(amount) * 100);

    // Create product in Stripe
    const product = await stripe.products.create({
      name: product_name,
      description: description || undefined,
    });

    // Create price in Stripe
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amountInCents,
      currency: currency,
    });

    // Determine the success URL based on custom domain
    const successUrl = tenant.custom_domain && tenant.domain_verified
      ? `https://${tenant.custom_domain}/ty?session_id={CHECKOUT_SESSION_ID}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/ty?session_id={CHECKOUT_SESSION_ID}`;

    // Create payment link in Stripe with custom success URL
    const stripePaymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: successUrl,
        },
      },
    });

    // Save payment link to database
    const { data: paymentLink, error } = await supabaseAdmin
      .from('payment_links')
      .insert({
        tenant_id: tenant.id,
        name,
        stripe_payment_link: stripePaymentLink.url,
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

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('id');
    const body = await request.json();
    const { name } = body;

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get tenant ID
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Update payment link name (ensure it belongs to this tenant)
    const { error } = await supabaseAdmin
      .from('payment_links')
      .update({ name })
      .eq('id', linkId)
      .eq('tenant_id', tenant.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating payment link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('id');

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    // Get tenant ID
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Delete payment link (ensure it belongs to this tenant)
    const { error } = await supabaseAdmin
      .from('payment_links')
      .delete()
      .eq('id', linkId)
      .eq('tenant_id', tenant.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting payment link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
