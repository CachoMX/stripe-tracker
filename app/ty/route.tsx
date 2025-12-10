import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { retrieveCheckoutSession } from '@/lib/stripe/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const host = request.headers.get('host');

    if (!sessionId) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error - Payment Tracker</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, rgb(127, 86, 217) 100%);
                color: white;
                text-align: center;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <div>
              <h1>⚠️ Invalid Request</h1>
              <p>No session ID provided</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Find tenant by custom domain or use default
    let tenant;

    // Try to find by custom domain first (only for verified custom domains)
    if (host && !host.includes('localhost') && !host.includes('vercel.app') && !host.includes('pingitnow.com')) {
      const { data } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .eq('custom_domain', host)
        .eq('domain_verified', true)
        .single();

      tenant = data;
    }

    // If no custom domain match, get the first tenant (for localhost, vercel.app, or default domains)
    if (!tenant) {
      const { data } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      tenant = data;
    }

    if (!tenant || !tenant.stripe_secret_key) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error - Payment Tracker</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, rgb(127, 86, 217) 100%);
                color: white;
                text-align: center;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <div>
              <h1>⚠️ Configuration Error</h1>
              <p>Tenant not found or not configured</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Retrieve session from Stripe
    const session = await retrieveCheckoutSession(
      tenant.stripe_secret_key,
      sessionId
    );

    const customerEmail = session.customer_details?.email || 'No email provided';
    const customerName = session.customer_details?.name || '';

    // Try to match payment link from session metadata or success_url
    let paymentLinkId = null;
    const successUrl = session.success_url || '';

    if (successUrl) {
      // Extract Stripe payment link URL from success_url
      const urlMatch = successUrl.match(/https:\/\/buy\.stripe\.com\/[^\?&]+/);
      if (urlMatch) {
        const stripeLinkUrl = urlMatch[0];

        // Find matching payment link in database
        const { data: matchedLink } = await supabaseAdmin
          .from('payment_links')
          .select('id')
          .eq('tenant_id', tenant.id)
          .eq('stripe_payment_link', stripeLinkUrl)
          .single();

        if (matchedLink) {
          paymentLinkId = matchedLink.id;
        }
      }
    }

    // Log transaction
    await supabaseAdmin.from('transactions').insert({
      tenant_id: tenant.id,
      stripe_session_id: sessionId,
      stripe_payment_intent_id: session.payment_intent as string,
      customer_email: customerEmail,
      customer_name: customerName,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'completed',
      metadata: session.metadata,
      payment_link_id: paymentLinkId,
    });

    // Redirect to add email to URL if not present
    const url = new URL(request.url);
    const emailParam = url.searchParams.get('email');

    if (!emailParam && customerEmail !== 'No email provided') {
      url.searchParams.set('email', customerEmail);
      return NextResponse.redirect(url.toString());
    }

    // Render thank you page with Hyros script and optional redirect
    const redirectEnabled = tenant.redirect_enabled || false;
    const redirectSeconds = tenant.redirect_seconds || 5;
    const redirectUrl = tenant.redirect_url || '';

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You - Payment Successful</title>

        ${tenant.hyros_tracking_script || ''}

        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, rgb(127, 86, 217) 100%);
            padding: 20px;
          }

          .container {
            background: white;
            padding: 60px 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 600px;
            width: 100%;
          }

          h1 {
            color: rgb(127, 86, 217);
            font-size: 2.5rem;
            margin-bottom: 20px;
            line-height: 1.2;
          }

          .success-icon {
            font-size: 5rem;
            margin-bottom: 20px;
          }

          .message {
            font-size: 1.2rem;
            color: #555;
            margin-bottom: 30px;
            line-height: 1.6;
          }

          .email {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
            color: #374151;
          }

          .countdown {
            font-size: 1.5rem;
            color: rgb(127, 86, 217);
            font-weight: 700;
            margin: 30px 0 20px 0;
            animation: pulse 1s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.8;
            }
          }

          .redirect-message {
            font-size: 1rem;
            color: #6b7280;
            margin-top: 10px;
          }

          @media (max-width: 600px) {
            h1 {
              font-size: 1.8rem;
            }

            .container {
              padding: 40px 30px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Thank You For Your Purchase!</h1>
          <p class="message">Your payment has been processed successfully.</p>

          <div class="email">
            <span id="customer-email">${customerEmail}</span>
          </div>

          <p class="message" style="font-size: 1rem; color: #6b7280;">
            You will receive a confirmation email shortly.
          </p>

          ${
            redirectEnabled && redirectUrl
              ? `
          <div class="countdown" id="countdown">
            Redirecting in <span id="seconds">${redirectSeconds}</span>...
          </div>
          <p class="redirect-message">You will be automatically redirected to the next step.</p>
          `
              : ''
          }
        </div>

        ${
          redirectEnabled && redirectUrl
            ? `
        <script>
          let seconds = ${redirectSeconds};
          const countdownElement = document.getElementById('seconds');

          const interval = setInterval(() => {
            seconds--;
            if (countdownElement) {
              countdownElement.textContent = seconds;
            }

            if (seconds <= 0) {
              clearInterval(interval);
              window.location.href = '${redirectUrl}';
            }
          }, 1000);
        </script>
        `
            : ''
        }
      </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error: any) {
    console.error('Error in thank you page:', error);

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error - Payment Tracker</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, rgb(127, 86, 217) 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div>
            <h1>⚠️ Error</h1>
            <p>${error.message || 'An error occurred'}</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}
