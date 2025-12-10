import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MINUTES = [5, 15, 60, 240, 1440]; // 5min, 15min, 1h, 4h, 24h

export async function POST(request: NextRequest) {
  try {
    // ✅ Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.error('Unauthorized retry attempt', { authHeader });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Get failed webhooks that need retry
    const { data: failedWebhooks, error: fetchError } = await supabaseAdmin
      .from('failed_webhooks')
      .select('*')
      .lt('retry_count', MAX_RETRY_ATTEMPTS)
      .or(`last_retry_at.is.null,last_retry_at.lt.${new Date(Date.now() - 5 * 60 * 1000).toISOString()}`)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      logger.error('Failed to fetch failed webhooks', { error: fetchError.message });
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!failedWebhooks || failedWebhooks.length === 0) {
      logger.info('No failed webhooks to retry');
      return NextResponse.json({ message: 'No webhooks to retry', processed: 0 });
    }

    logger.info(`Retrying ${failedWebhooks.length} failed webhooks`);

    let successCount = 0;
    let failCount = 0;

    for (const webhook of failedWebhooks) {
      try {
        const event = webhook.payload as Stripe.Event;

        logger.info('Retrying webhook', {
          eventId: webhook.event_id,
          eventType: webhook.event_type,
          retryCount: webhook.retry_count + 1,
        });

        // ✅ Process webhook based on event type
        await processWebhookEvent(event);

        // ✅ Mark as successfully processed - remove from failed_webhooks
        await supabaseAdmin
          .from('failed_webhooks')
          .delete()
          .eq('id', webhook.id);

        // ✅ Add to webhook_events to prevent reprocessing
        await supabaseAdmin
          .from('webhook_events')
          .insert({
            id: webhook.event_id,
            event_type: webhook.event_type,
            payload: webhook.payload,
          });

        logger.info('Webhook retry successful', {
          eventId: webhook.event_id,
          eventType: webhook.event_type,
        });

        successCount++;
      } catch (error: any) {
        logger.error('Webhook retry failed', {
          eventId: webhook.event_id,
          eventType: webhook.event_type,
          error: error.message,
        });

        // ✅ Update retry count and last_retry_at
        await supabaseAdmin
          .from('failed_webhooks')
          .update({
            retry_count: webhook.retry_count + 1,
            last_retry_at: new Date().toISOString(),
            error: error.message,
          })
          .eq('id', webhook.id);

        failCount++;
      }
    }

    logger.info('Webhook retry batch completed', { successCount, failCount });

    return NextResponse.json({
      message: 'Retry batch completed',
      processed: failedWebhooks.length,
      successful: successCount,
      failed: failCount,
    });
  } catch (error: any) {
    logger.error('Retry cron error', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscription = session.subscription as string;
      const customerId = session.customer as string;

      if (!subscription || !customerId) {
        throw new Error('Missing subscription or customer ID');
      }

      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (!tenant) {
        throw new Error(`Tenant not found for customer ${customerId}`);
      }

      const subscriptionData = await stripe.subscriptions.retrieve(subscription);

      await supabaseAdmin
        .from('tenants')
        .update({
          stripe_subscription_id: subscription,
          subscription_status: subscriptionData.status,
          subscription_period_start: new Date((subscriptionData as any).current_period_start * 1000).toISOString(),
          subscription_period_end: new Date((subscriptionData as any).current_period_end * 1000).toISOString(),
        })
        .eq('id', tenant.id);

      logger.webhook.processed('checkout.session.completed', (event as any).id, tenant.id);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (!tenant) {
        throw new Error(`Tenant not found for customer ${customerId}`);
      }

      await supabaseAdmin
        .from('tenants')
        .update({
          subscription_status: subscription.status,
          subscription_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          subscription_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        })
        .eq('id', tenant.id);

      logger.webhook.processed('customer.subscription.updated', (event as any).id, tenant.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (!tenant) {
        throw new Error(`Tenant not found for customer ${customerId}`);
      }

      await supabaseAdmin
        .from('tenants')
        .update({
          subscription_status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('id', tenant.id);

      logger.webhook.processed('customer.subscription.deleted', (event as any).id, tenant.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (!tenant) {
        throw new Error(`Tenant not found for customer ${customerId}`);
      }

      await supabaseAdmin
        .from('tenants')
        .update({
          subscription_status: 'past_due',
        })
        .eq('id', tenant.id);

      logger.warn('Payment failed for subscription', {
        eventType: 'invoice.payment_failed',
        tenantId: tenant.id,
        customerId,
      });
      break;
    }

    default:
      logger.info(`Unhandled event type in retry: ${event.type}`, {
        eventType: event.type,
        eventId: (event as any).id,
      });
  }
}
