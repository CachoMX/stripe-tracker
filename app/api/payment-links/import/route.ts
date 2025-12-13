import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';

// GET - Fetch existing payment links from Stripe
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant's Stripe credentials
    const { data: tenant } = await supabase
      .from('tenants')
      .select('stripe_secret_key')
      .eq('clerk_user_id', user.id)
      .single();

    if (!tenant?.stripe_secret_key) {
      return NextResponse.json(
        { error: 'Stripe not connected. Please connect your Stripe account first.' },
        { status: 400 }
      );
    }

    // Initialize Stripe with tenant's key
    const stripe = new Stripe(tenant.stripe_secret_key, {
      apiVersion: '2025-11-17.clover' as any,
    });

    // Fetch all payment links from Stripe
    const paymentLinks = await stripe.paymentLinks.list({
      limit: 100, // Adjust if needed
      active: true,
    });

    // Get existing payment links from database to filter out already imported ones
    const { data: existingLinks } = await supabase
      .from('payment_links')
      .select('stripe_payment_link_id')
      .eq('tenant_id', (tenant as any).id);

    const existingLinkIds = new Set(existingLinks?.map(l => l.stripe_payment_link_id) || []);

    // Filter out already imported links
    const availableToImport = paymentLinks.data.filter(
      link => !existingLinkIds.has(link.id)
    );

    // Map to simplified format
    const formattedLinks = availableToImport.map(link => ({
      id: link.id,
      url: link.url,
      active: link.active,
      amount: link.line_items?.data[0]?.price?.unit_amount || 0,
      currency: link.line_items?.data[0]?.price?.currency || 'usd',
      product_name: link.line_items?.data[0]?.price?.product?.name || 'Unknown Product',
      description: link.line_items?.data[0]?.price?.product?.description || null,
      metadata: link.metadata || {},
    }));

    return NextResponse.json({
      availableLinks: formattedLinks,
      totalCount: formattedLinks.length,
      alreadyImported: existingLinkIds.size,
    });
  } catch (error: any) {
    console.error('Error fetching Stripe payment links:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment links from Stripe' },
      { status: 500 }
    );
  }
}

// POST - Import selected payment links with thank you pages
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { linksToImport } = body; // Array of { linkId, tyPageUrl }

    if (!linksToImport || !Array.isArray(linksToImport) || linksToImport.length === 0) {
      return NextResponse.json(
        { error: 'No links provided for import' },
        { status: 400 }
      );
    }

    // Get tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('*')
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

    const importedLinks = [];
    const errors = [];

    for (const { linkId, tyPageUrl } of linksToImport) {
      try {
        // Fetch the payment link from Stripe
        const paymentLink = await stripe.paymentLinks.retrieve(linkId);

        // Update payment link metadata with thank you page URL
        const updatedLink = await stripe.paymentLinks.update(linkId, {
          metadata: {
            ...paymentLink.metadata,
            ty_page_url: tyPageUrl,
          },
        });

        // Get price and product info
        const priceId = paymentLink.line_items.data[0]?.price?.id;
        const price = priceId ? await stripe.prices.retrieve(priceId) : null;
        const productId = typeof price?.product === 'string' ? price.product : price?.product?.id;
        const product = productId ? await stripe.products.retrieve(productId) : null;

        // Insert into database
        const { data: insertedLink, error: insertError } = await supabase
          .from('payment_links')
          .insert({
            tenant_id: tenant.id,
            stripe_payment_link_id: paymentLink.id,
            stripe_product_id: productId || null,
            stripe_price_id: priceId || null,
            product_name: product?.name || 'Imported Product',
            description: product?.description || null,
            amount: price?.unit_amount || 0,
            currency: price?.currency || 'usd',
            checkout_url: paymentLink.url,
            active: paymentLink.active,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        importedLinks.push(insertedLink);
      } catch (error: any) {
        console.error(`Error importing link ${linkId}:`, error);
        errors.push({
          linkId,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedLinks.length,
      failed: errors.length,
      importedLinks,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error importing payment links:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import payment links' },
      { status: 500 }
    );
  }
}
