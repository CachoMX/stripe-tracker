import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

// Plan configuration with Price IDs (you'll update these after creating products)
const PLAN_CONFIG = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
    transactionLimit: 500,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
    transactionLimit: 5000,
  },
  business: {
    priceId: process.env.STRIPE_PRICE_BUSINESS || 'price_business_placeholder',
    transactionLimit: -1, // unlimited
  },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get tenant
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Initialize Stripe with platform account
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    });

    const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];
    let customerId = tenant.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenant.email,
        metadata: {
          tenant_id: tenant.id,
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update tenant with customer ID
      await supabaseAdmin
        .from('tenants')
        .update({ stripe_customer_id: customerId })
        .eq('id', tenant.id);
    }

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/ty?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?subscription=canceled`,
      metadata: {
        tenant_id: tenant.id,
        user_id: user.id,
        plan: plan,
        subscription_payment: 'true', // Flag to identify this is a subscription
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Error creating subscription checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
