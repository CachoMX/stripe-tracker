# Subscription Setup Guide

## Overview
This guide will help you set up Stripe subscriptions for your Ping platform.

## Step 1: Create Products in Stripe Dashboard

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Click "Add product"
3. Create these three products:

### Product 1: Ping Starter
- **Product name**: Ping Starter
- **Description**: Perfect for solo entrepreneurs and small stores
- **Pricing model**: Standard pricing
- **Price**: $29.00 USD
- **Billing period**: Monthly
- **After creating, copy the Price ID** (looks like `price_1abc123...`)

### Product 2: Ping Pro
- **Product name**: Ping Pro
- **Description**: For growing businesses and agencies
- **Pricing model**: Standard pricing
- **Price**: $79.00 USD
- **Billing period**: Monthly
- **After creating, copy the Price ID**

### Product 3: Ping Business
- **Product name**: Ping Business
- **Description**: For high-volume and enterprise needs
- **Pricing model**: Standard pricing
- **Price**: $199.00 USD
- **Billing period**: Monthly
- **After creating, copy the Price ID**

## Step 2: Add Environment Variables

Add these to your `.env.local` and Vercel:

```env
# Stripe Subscription Price IDs
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx  # Replace with your Starter Price ID
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx      # Replace with your Pro Price ID
STRIPE_PRICE_BUSINESS=price_xxxxxxxxxxxxx # Replace with your Business Price ID

# Stripe Webhook Secret (from Step 3)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## Step 3: Set Up Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL**: `https://www.pingitnow.com/api/webhooks/stripe`
4. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copy the Signing secret** (starts with `whsec_`)
7. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 4: Run Database Migration

Go to Supabase SQL Editor and run:

```sql
-- Add subscription management fields to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS transaction_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS transaction_limit INTEGER DEFAULT 500;

-- Add indexes for subscription lookups
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id ON tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_subscription_id ON tenants(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);
```

## Step 5: Test the Flow

1. Go to `https://www.pingitnow.com/pricing`
2. Click "Get Started" on any plan
3. You'll be redirected to Stripe Checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete the checkout
6. You should be redirected back to the dashboard
7. Check Supabase to verify subscription data was saved

## Step 6: Test Webhook (Optional but Recommended)

Install Stripe CLI for local testing:

```bash
# Install Stripe CLI
# Windows: https://github.com/stripe/stripe-cli/releases
# Mac: brew install stripe/stripe-brew/stripe

# Login to Stripe
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## How It Works

### User Flow:
1. User clicks "Get Started" on pricing page
2. System creates/retrieves Stripe Customer
3. Redirects to Stripe Checkout with subscription
4. User completes payment
5. Stripe sends webhook to your server
6. Webhook updates subscription status in database
7. User redirected back to dashboard

### Subscription Events:
- **checkout.session.completed**: Creates new subscription
- **customer.subscription.updated**: Updates subscription details
- **customer.subscription.deleted**: Marks subscription as canceled
- **invoice.payment_failed**: Marks subscription as past_due

### Plan Limits:
- **Starter**: 500 transactions/month
- **Pro**: 5,000 transactions/month
- **Business**: Unlimited transactions

## Files Created

1. `app/api/create-subscription/route.ts` - Creates Stripe Checkout sessions
2. `app/api/webhooks/stripe/route.ts` - Handles subscription webhooks
3. `app/pricing/page.tsx` - Updated with checkout buttons
4. `lib/supabase/migration-add-subscription-fields.sql` - Database migration

## Next Steps (Optional)

1. **Add subscription status to dashboard** - Show current plan and usage
2. **Implement plan limits** - Block actions when limit reached
3. **Add upgrade/downgrade flow** - Allow users to change plans
4. **Add cancel subscription** - Allow users to cancel from dashboard
5. **Email notifications** - Send emails for subscription events
6. **Invoice history** - Show past invoices to users

## Testing Cards

Use these test cards in Stripe Checkout:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

## Troubleshooting

**Webhook not receiving events:**
- Check endpoint URL is correct
- Verify events are selected in Stripe dashboard
- Check webhook signing secret matches environment variable

**Subscription not creating:**
- Verify Price IDs are correct in environment variables
- Check Stripe API logs in dashboard
- Ensure STRIPE_SECRET_KEY is set correctly

**Users can't checkout:**
- Ensure user is logged in
- Check browser console for errors
- Verify API route is accessible
