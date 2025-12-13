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
      .select('id, stripe_secret_key')
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
      limit: 100,
      active: true,
    });

    // Get existing payment links from database to filter out already imported ones
    const { data: existingLinks } = await supabase
      .from('payment_links')
      .select('stripe_payment_link_id')
      .eq('tenant_id', tenant.id);

    const existingLinkIds = new Set(existingLinks?.map(l => l.stripe_payment_link_id) || []);

    // Get user's domains
    const { data: domains } = await supabase
      .from('domains')
      .select('domain, ty_page_url')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    // Filter out already imported links
    const availableToImport = paymentLinks.data.filter(
      link => !existingLinkIds.has(link.id)
    );

    // Fetch full details for each link including line_items
    const formattedLinks = await Promise.all(availableToImport.map(async (link) => {
      let productName = 'Unknown Product';
      let productDescription = null;
      let amount = 0;
      let currency = 'usd';
      let existingRedirectUrl = null;

      try {
        // Retrieve full payment link with line_items expanded
        const fullLink = await stripe.paymentLinks.retrieve(link.id, {
          expand: ['line_items.data.price'],
        });

        const lineItem = fullLink.line_items?.data[0];
        const price = lineItem?.price;

        if (price) {
          amount = price.unit_amount || 0;
          currency = price.currency;

          // Get product details
          const productId = typeof price.product === 'string' ? price.product : price.product?.id;
          if (productId) {
            const product = await stripe.products.retrieve(productId);
            productName = product.name;
            productDescription = product.description || null;
          }
        }

        // Get existing redirect URL from either metadata or after_completion
        if (fullLink.metadata?.ty_page_url) {
          existingRedirectUrl = fullLink.metadata.ty_page_url;
        } else if (fullLink.after_completion?.type === 'redirect' && fullLink.after_completion.redirect?.url) {
          existingRedirectUrl = fullLink.after_completion.redirect.url;
        }
      } catch (error) {
        console.error(`Error fetching details for link ${link.id}:`, error);
      }

      return {
        id: link.id,
        url: link.url,
        active: link.active,
        amount,
        currency,
        product_name: productName,
        description: productDescription,
        metadata: link.metadata || {},
        existing_ty_page_url: existingRedirectUrl,
      };
    }));

    return NextResponse.json({
      availableLinks: formattedLinks,
      totalCount: formattedLinks.length,
      alreadyImported: existingLinkIds.size,
      domains: domains || [],
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
        const priceId = paymentLink.line_items?.data[0]?.price?.id;
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
