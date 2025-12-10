import Stripe from 'stripe';
import { logger } from '@/lib/logger';

/**
 * Match a Stripe checkout session to a payment link in the database
 * Returns the payment link ID if found, null otherwise
 */
export async function matchPaymentLinkFromSession(
  stripeSecretKey: string,
  session: Stripe.Checkout.Session,
  tenantId: string,
  supabaseAdmin: any
): Promise<string | null> {
  // Check if this session came from a payment link
  if (!session.payment_link) {
    logger.info('Session did not come from a payment link', { sessionId: session.id });
    return null;
  }

  try {
    // Initialize Stripe with tenant's key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    // Retrieve the payment link details from Stripe
    const paymentLink = await stripe.paymentLinks.retrieve(session.payment_link as string);
    const paymentLinkUrl = paymentLink.url;

    logger.info('Retrieved payment link from Stripe', {
      paymentLinkId: session.payment_link,
      url: paymentLinkUrl,
    });

    // Find matching payment link in database
    const { data: matchedLink, error } = await supabaseAdmin
      .from('payment_links')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('stripe_payment_link', paymentLinkUrl)
      .single();

    if (error || !matchedLink) {
      logger.warn('No matching payment link found in database', {
        tenantId,
        paymentLinkUrl,
        error: error?.message,
      });
      return null;
    }

    logger.info('Matched payment link', {
      paymentLinkId: matchedLink.id,
      tenantId,
    });

    return matchedLink.id;
  } catch (error: any) {
    logger.error('Error retrieving payment link from Stripe', {
      sessionId: session.id,
      error: error.message,
    });
    return null;
  }
}
