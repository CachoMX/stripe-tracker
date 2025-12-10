import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { checkoutSessionId } = body;

    if (!checkoutSessionId) {
      return NextResponse.json(
        { error: 'Checkout session ID is required' },
        { status: 400 }
      );
    }

    // Get tenant and checkout session config
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('*, custom_domain')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant || !tenant.stripe_secret_key) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 400 }
      );
    }

    const { data: checkoutConfig } = await supabaseAdmin
      .from('checkout_sessions')
      .select('*')
      .eq('id', checkoutSessionId)
      .single();

    if (!checkoutConfig) {
      return NextResponse.json(
        { error: 'Checkout session config not found' },
        { status: 404 }
      );
    }

    // Create Stripe checkout session
    const stripe = new Stripe(tenant.stripe_secret_key, {
      apiVersion: '2025-11-17.clover',
    });

    const successUrl = tenant.custom_domain && tenant.domain_verified
      ? `https://${tenant.custom_domain}/ty?session_id={CHECKOUT_SESSION_ID}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/ty?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: checkoutConfig.currency,
            product_data: {
              name: checkoutConfig.product_name,
            },
            unit_amount: checkoutConfig.amount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
