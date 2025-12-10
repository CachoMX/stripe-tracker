# 🔒 Security Setup Guide

This document contains **CRITICAL** security configurations that **MUST** be implemented before going to production.

---

## ⚠️ CRITICAL: Row Level Security (RLS) Setup

**Status:** ❌ NOT YET CONFIGURED (must be done manually in Supabase)

**Why this is critical:**
Without RLS, an attacker can modify HTTP requests to access data from other tenants (Stripe keys, transactions, customer emails, etc.). This is a **CRITICAL data breach vulnerability**.

### How to implement:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and paste** the entire contents of `lib/supabase/migration-add-rls-policies.sql`
3. **Execute** the SQL migration
4. **Verify** RLS is enabled by running:

```sql
-- Check that RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'payment_links', 'transactions', 'checkout_sessions');

-- Should return all tables with rowsecurity = true
```

5. **Test** that policies work correctly:

```sql
-- This should only return YOUR tenant (not others)
SELECT * FROM tenants;

-- This should only return YOUR payment links (not others)
SELECT * FROM payment_links;
```

### What this does:

- ✅ Users can **ONLY** access their own tenant data
- ✅ Users can **ONLY** view/edit their own payment links
- ✅ Users can **ONLY** view their own transactions
- ✅ Webhooks still work (service role bypasses RLS automatically)
- ✅ Protection against SQL injection and request tampering

---

## ✅ XSS Protection (Already Implemented)

**Status:** ✅ IMPLEMENTED

Protection against Cross-Site Scripting (XSS) attacks via Hyros tracking script:

### Features:

1. **Domain Whitelist** (`app/dashboard/settings/page.tsx`):
   - Only allows scripts from trusted domains (Hyros, Google Analytics, Facebook Pixel)
   - Rejects any script from unknown domains

2. **Input Validation**:
   - Validates script format (must be valid `<script>` tag)
   - Extracts and validates `src` URL
   - Shows clear error messages to users

3. **Output Sanitization** (`app/ty/route.tsx`):
   - Uses `DOMPurify` to sanitize script before injecting into HTML
   - Only allows safe tags (`<script>`) and attributes (`src`, `type`, `async`, etc.)
   - Prevents malicious code execution

### To add more trusted domains:

Edit `ALLOWED_TRACKING_DOMAINS` in `app/dashboard/settings/page.tsx`:

```typescript
const ALLOWED_TRACKING_DOMAINS = [
  'data.hyros.com',
  'analytics.google.com',
  'www.googletagmanager.com',
  'connect.facebook.net',
  // Add more trusted domains here
];
```

---

## ✅ Rate Limiting (Already Implemented)

**Status:** ✅ IMPLEMENTED

Protection against DDoS and API abuse:

### Features:

1. **Middleware Rate Limiting** (`middleware.ts`):
   - Limits requests per IP address
   - Applies to all `/api/*` routes
   - Returns HTTP 429 (Too Many Requests) when limit exceeded

2. **Configuration**:
   - Default: 100 requests per minute per IP
   - Window: 60 seconds (rolling window)
   - Can be adjusted in `middleware.ts`

### To adjust rate limits:

Edit constants in `middleware.ts`:

```typescript
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per window
```

---

## ✅ Webhook Security (Already Implemented)

**Status:** ✅ IMPLEMENTED

### Features:

1. **Signature Verification**:
   - All webhooks verify Stripe signature
   - Rejects unsigned or tampered requests

2. **Idempotency Check** (`lib/supabase/migration-webhook-idempotency.sql`):
   - Prevents duplicate webhook processing
   - Uses `webhook_events` table to track processed events
   - Returns early if event already processed

3. **Retry Logic** (`app/api/webhooks/retry/route.ts`):
   - Stores failed webhooks in `failed_webhooks` table
   - Cron job retries with exponential backoff
   - Max 5 retry attempts

4. **Structured Logging** (`lib/logger.ts`):
   - All webhook events logged with context
   - Easy debugging in production
   - JSON format for log aggregation services

---

## ✅ Transaction Limits (Already Implemented)

**Status:** ✅ IMPLEMENTED

Protection against service abuse:

### Features:

1. **Per-Plan Limits** (`lib/transaction-limits.ts`):
   - Starter: 500 transactions/month
   - Pro: 2,000 transactions/month
   - Enterprise: Unlimited

2. **Enforcement**:
   - Checked before creating payment links
   - Checked in webhook handlers
   - Returns HTTP 403 when limit reached

3. **Usage Tracking**:
   - Real-time usage stats in dashboard
   - Monthly reset based on billing date
   - Visual indicators when approaching limit

---

## 📋 Pre-Launch Checklist

Before deploying to production, verify:

- [ ] **RLS policies executed in Supabase** (CRITICAL)
- [ ] **RLS verification queries pass** (see above)
- [ ] **Test with 2 different users** to ensure data isolation
- [ ] **Hyros script domain whitelist** configured
- [ ] **Rate limiting tested** with curl or Postman
- [ ] **Webhook idempotency tested** (send duplicate webhook)
- [ ] **Environment variables set** in Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `CRON_SECRET`
  - [ ] `VERCEL_API_TOKEN`
- [ ] **Cron job configured** in cron-job.com (see `docs/CRON_JOBS_CONFIG.md`)
- [ ] **Custom domain SSL** configured (if using custom domains)

---

## 🚨 Security Incident Response

If you suspect a security breach:

1. **Immediately rotate all secrets**:
   - Supabase service role key
   - Stripe webhook secret
   - CRON_SECRET
   - Vercel API token

2. **Check Supabase logs** for unauthorized access:
   - Go to Supabase Dashboard → Logs
   - Filter by RLS policy violations
   - Look for suspicious queries

3. **Check Vercel logs** for unusual API activity:
   - Go to Vercel Dashboard → Logs
   - Filter by 401/403/429 status codes
   - Look for unusual IP addresses

4. **Notify affected users** if data was compromised

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

**Last Updated:** 2025-12-10
**Security Audit Status:** ⚠️ RLS NOT YET CONFIGURED
