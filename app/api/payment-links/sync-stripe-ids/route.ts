import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

// POST - Sync Stripe IDs for existing payment links
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id, stripe_secret_key')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant?.stripe_secret_key) {
      return NextResponse.json(
        { error: 'Stripe not connected' },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(tenant.stripe_secret_key, {
      apiVersion: '2025-11-17.clover' as any,
    });

    // Get all payment links from database that don't have stripe_payment_link_id
    const { data: linksWithoutId } = await supabaseAdmin
      .from('payment_links')
      .select('id, stripe_payment_link, name')
      .eq('tenant_id', tenant.id)
      .is('stripe_payment_link_id', null);

    if (!linksWithoutId || linksWithoutId.length === 0) {
      return NextResponse.json({
        message: 'No links need syncing',
        updated: 0,
      });
    }

    // Fetch all payment links from Stripe
    const stripeLinks = await stripe.paymentLinks.list({ limit: 100 });

    let updated = 0;
    let errors = 0;

    // Match by URL and update
    for (const dbLink of linksWithoutId) {
      try {
        // Find matching Stripe link by URL
        const matchingStripeLink = stripeLinks.data.find(
          (sl) => sl.url === dbLink.stripe_payment_link
        );

        if (matchingStripeLink) {
          // Fetch full details including line_items
          const fullLink = await stripe.paymentLinks.retrieve(matchingStripeLink.id, {
            expand: ['line_items.data.price'],
          });

          const lineItem = fullLink.line_items?.data[0];
          const priceId = lineItem?.price?.id;
          const price = lineItem?.price;
          const productId = typeof price?.product === 'string'
            ? price.product
            : price?.product?.id;

          // Get product name with type guard
          const product = typeof price?.product === 'object' && price.product && !('deleted' in price.product)
            ? price.product
            : null;
          const productName = product?.name || dbLink.name;

          // Update database with Stripe ID and additional info
          const { error: updateError } = await supabaseAdmin
            .from('payment_links')
            .update({
              stripe_payment_link_id: matchingStripeLink.id,
              stripe_product_id: productId || null,
              stripe_price_id: priceId || null,
              product_name: productName,
              amount: price?.unit_amount || 0,
              currency: price?.currency || 'usd',
              checkout_url: matchingStripeLink.url,
              active: matchingStripeLink.active,
            })
            .eq('id', dbLink.id);

          if (updateError) {
            console.error(`Error updating link ${dbLink.id}:`, updateError);
            errors++;
          } else {
            updated++;
          }
        }
      } catch (err) {
        console.error(`Error processing link ${dbLink.id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      message: `Synced ${updated} payment link(s)`,
      updated,
      errors,
      total: linksWithoutId.length,
    });
  } catch (error: any) {
    console.error('Error syncing Stripe IDs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync Stripe IDs' },
      { status: 500 }
    );
  }
}
