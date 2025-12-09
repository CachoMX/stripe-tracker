// Simple encryption utility for Stripe keys
// In production, use proper encryption with KMS or similar

export function encryptStripeKey(key: string): string {
  // For now, we'll store as-is in Supabase
  // In production: use crypto library or Supabase Vault
  return key;
}

export function decryptStripeKey(encryptedKey: string): string {
  // For now, return as-is
  // In production: decrypt using crypto library
  return encryptedKey;
}

// Validate Stripe key format
export function isValidStripeSecretKey(key: string): boolean {
  return key.startsWith('sk_test_') || key.startsWith('sk_live_');
}

export function isValidStripePublishableKey(key: string): boolean {
  return key.startsWith('pk_test_') || key.startsWith('pk_live_');
}
