export interface Tenant {
  id: string;
  clerk_user_id: string;
  email: string;
  stripe_secret_key: string | null;
  stripe_publishable_key: string | null;
  hyros_tracking_script: string | null;
  custom_domain: string | null;
  domain_verified: boolean;
  domain_verification_token: string | null;
  subscription_status: string;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentLink {
  id: string;
  tenant_id: string;
  stripe_payment_link_id: string | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  product_name: string;
  description: string | null;
  amount: number;
  currency: string;
  checkout_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckoutSession {
  id: string;
  tenant_id: string;
  stripe_session_id: string;
  stripe_customer_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, any> | null;
  created_at: string;
  completed_at: string | null;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string;
  customer_name: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_link_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}
