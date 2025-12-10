import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Plan limits mapping
const PLAN_LIMITS = {
  starter: 500,
  pro: 5000,
  business: -1, // unlimited
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only handle subscription checkouts
        if (session.mode === 'subscription') {
          let tenantId = session.metadata?.tenant_id;
          const plan = session.metadata?.plan || 'starter';

          if (session.subscription) {
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string,
              { expand: ['latest_invoice', 'customer'] }
            );

            // If no tenant_id in metadata, try to find by customer_id
            if (!tenantId && session.customer) {
              const { data: tenant } = await supabaseAdmin
                .from('tenants')
                .select('id')
                .eq('stripe_customer_id', session.customer as string)
                .single();

              if (tenant) {
                tenantId = tenant.id;
              }
            }

            if (tenantId) {
              await supabaseAdmin
                .from('tenants')
                .update({
                  stripe_customer_id: subscription.customer as string,
                  stripe_subscription_id: subscription.id,
                  subscription_plan: plan,
                  subscription_status: subscription.status,
                  subscription_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
                  subscription_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                  transaction_limit: PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS],
                  trial_ends_at: null, // Remove trial when subscription starts
                })
                .eq('id', tenantId);

              console.log('✅ Subscription created:', subscription.id);
            } else {
              console.error('❌ Could not find tenant for subscription:', subscription.id);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find tenant by customer ID
        const { data: tenant } = await supabaseAdmin
          .from('tenants')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (tenant) {
          await supabaseAdmin
            .from('tenants')
            .update({
              subscription_status: subscription.status,
              subscription_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              subscription_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', tenant.id);

          console.log('✅ Subscription updated:', subscription.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find tenant by customer ID
        const { data: tenant } = await supabaseAdmin
          .from('tenants')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (tenant) {
          await supabaseAdmin
            .from('tenants')
            .update({
              subscription_status: 'canceled',
              stripe_subscription_id: null,
            })
            .eq('id', tenant.id);

          console.log('✅ Subscription canceled:', subscription.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find tenant by customer ID
        const { data: tenant } = await supabaseAdmin
          .from('tenants')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (tenant) {
          await supabaseAdmin
            .from('tenants')
            .update({
              subscription_status: 'past_due',
            })
            .eq('id', tenant.id);

          console.log('⚠️ Payment failed for subscription');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
