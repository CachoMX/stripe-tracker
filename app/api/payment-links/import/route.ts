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

    // Get tenant's Stripe credentials and domain info
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, stripe_secret_key, custom_domain, domain_verified')
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

    // Build domains array from tenant's custom domain
    const domains = [];
    if (tenant.custom_domain && tenant.domain_verified) {
      const tyPageUrl = `https://${tenant.custom_domain}/ty`;
      domains.push({
        domain: tenant.custom_domain,
        ty_page_url: tyPageUrl,
      });
    }

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
        // Fetch the payment link from Stripe WITH line_items expanded
        const paymentLink = await stripe.paymentLinks.retrieve(linkId, {
          expand: ['line_items.data.price'],
        });

        // Note: We can't update payment links created outside this app
        // The ty_page_url will be stored in our database and fetched from Stripe metadata if it exists

        // Get price and product info
        const lineItem = paymentLink.line_items?.data[0];
        const price = lineItem?.price;
        const priceId = typeof price === 'object' && price ? price.id : null;
        const productId = typeof price?.product === 'string' ? price.product : price?.product?.id;
        const product = productId ? await stripe.products.retrieve(productId) : null;

        // Insert into database
        const { data: insertedLink, error: insertError } = await supabase
          .from('payment_links')
          .insert({
            tenant_id: tenant.id,
            stripe_payment_link_id: paymentLink.id,
            stripe_payment_link: paymentLink.url,
            stripe_product_id: productId || null,
            stripe_price_id: priceId || null,
            product_name: product?.name || 'Imported Product',
            description: product?.description || null,
            amount: price?.unit_amount || 0,
            currency: price?.currency || 'usd',
            checkout_url: paymentLink.url,
            active: paymentLink.active,
            name: product?.name || 'Imported Product',
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

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
