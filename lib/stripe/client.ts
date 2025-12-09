import Stripe from 'stripe';

export function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function retrieveCheckoutSession(
  secretKey: string,
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient(secretKey);
  return await stripe.checkout.sessions.retrieve(sessionId);
}

export async function createPaymentLink(
  secretKey: string,
  params: {
    productName: string;
    description?: string;
    amount: number;
    currency?: string;
    successUrl: string;
  }
): Promise<Stripe.PaymentLink> {
  const stripe = getStripeClient(secretKey);

  // Create product
  const product = await stripe.products.create({
    name: params.productName,
    description: params.description,
  });

  // Create price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: params.amount,
    currency: params.currency || 'usd',
  });

  // Create payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    after_completion: {
      type: 'redirect',
      redirect: {
        url: params.successUrl,
      },
    },
  });

  return paymentLink;
}

export async function createCheckoutSession(
  secretKey: string,
  params: {
    productName: string;
    description?: string;
    amount: number;
    currency?: string;
    successUrl: string;
    cancelUrl: string;
  }
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient(secretKey);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: params.currency || 'usd',
          product_data: {
            name: params.productName,
            description: params.description,
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return session;
}
