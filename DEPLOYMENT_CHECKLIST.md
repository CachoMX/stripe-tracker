# 🚀 Deployment Checklist - Ping It Now

## Pre-Deployment (Local)

### 1. Install Dependencies
```bash
npm install dompurify isomorphic-dompurify @types/dompurify
```
- [ ] Dependencies installed successfully
- [ ] Run `npm run build` to verify no TypeScript errors

### 2. Generate CRON_SECRET

**PowerShell (Windows):**
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
Write-Host "Your CRON_SECRET: $secret"
```

- [ ] CRON_SECRET generated
- [ ] Secret saved securely (you'll need it for step 4 and 5)

---

## Database Setup (Supabase)

### 3. Run SQL Migrations

Go to Supabase Dashboard → SQL Editor → New Query

**Execute in this order:**

#### Migration 1: RLS Policies
```bash
# Copy contents from:
lib/supabase/migration-add-rls-policies.sql
```
- [ ] Migration executed successfully
- [ ] No errors in Supabase logs

#### Migration 2: Webhook Idempotency
```bash
# Copy contents from:
lib/supabase/migration-webhook-idempotency.sql
```
- [ ] Migration executed successfully
- [ ] Tables created: `webhook_events`, `failed_webhooks`

#### Migration 3: Transaction Limits
```bash
# Copy contents from:
lib/supabase/migration-transaction-limits.sql
```
- [ ] Migration executed successfully
- [ ] Columns added: `transaction_limit`, `transactions_used`
- [ ] View created: `tenant_usage_stats`

### 4. Enable Realtime

In Supabase SQL Editor, run:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_links;
ALTER PUBLICATION supabase_realtime ADD TABLE tenants;
```

**Or via Dashboard:**
- [ ] Go to Database → Replication
- [ ] Enable replication for: `transactions`, `payment_links`, `tenants`

### 5. Verify RLS is Active

```sql
-- Should return 'true' for all tables
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tenants', 'payment_links', 'transactions', 'checkout_sessions');
```
- [ ] All tables show `rowsecurity = true`

---

## Vercel Configuration

### 6. Add Environment Variable

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add:
- **Key:** `CRON_SECRET`
- **Value:** (paste the secret from step 2)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- [ ] CRON_SECRET added to Vercel
- [ ] Available in all environments

### 7. Verify Existing Environment Variables

Ensure these are set:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`

---

## Code Deployment

### 8. Commit and Push

```bash
git add .
git commit -m "feat: implement security fixes and performance optimizations

- Add RLS policies for multi-tenant security
- Implement webhook idempotency and retry logic
- Add rate limiting middleware
- Implement XSS prevention for Hyros scripts
- Add structured logging
- Implement transaction limits per plan
- Optimize N+1 queries
- Add real-time updates
- Implement skeleton loading states
- Add tenant data caching"

git push origin main
```

- [ ] Changes committed
- [ ] Pushed to GitHub
- [ ] Vercel deployment triggered

### 9. Monitor Deployment

- [ ] Check Vercel deployment logs
- [ ] Deployment successful
- [ ] No build errors
- [ ] No runtime errors

---

## Cron Job Setup (cron-job.com)

### 10. Create Webhook Retry Cron

1. Go to https://cron-job.com
2. Create new cron job:

**Settings:**
- **Title:** Ping It Now - Webhook Retry
- **URL:** `https://your-production-domain.vercel.app/api/webhooks/retry`
- **Schedule:** `*/5 * * * *` (every 5 minutes)
- **Method:** POST
- **Headers:**
  ```
  Authorization: Bearer YOUR_CRON_SECRET_FROM_STEP_2
  ```

- [ ] Cron job created in cron-job.com
- [ ] URL points to production domain
- [ ] Authorization header configured
- [ ] Schedule set to every 5 minutes

### 11. Test Cron Endpoint Manually

**PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_CRON_SECRET"
}

Invoke-WebRequest -Uri "https://your-domain.vercel.app/api/webhooks/retry" `
    -Method POST `
    -Headers $headers `
    -UseBasicParsing
```

Expected response:
```json
{
  "message": "Retry batch completed",
  "processed": 0,
  "successful": 0,
  "failed": 0
}
```

- [ ] Manual test successful
- [ ] Status code 200
- [ ] JSON response received

---

## Post-Deployment Testing

### 12. Test Security Features

#### Test RLS Policies
1. Create 2 test accounts (Clerk)
2. Create payment link in Account 1
3. Try to access with Account 2's credentials
- [ ] Account 2 cannot see Account 1's data ✅

#### Test Rate Limiting
```bash
# Run multiple requests rapidly
for i in {1..25}; do
  curl https://your-domain.vercel.app/api/payment-links
done
```
- [ ] Returns 429 "Rate limit exceeded" after threshold ✅

#### Test Webhook Idempotency
1. Send test webhook from Stripe
2. Send same webhook again (duplicate event_id)
- [ ] Second webhook returns `{ "duplicate": true }` ✅

#### Test XSS Prevention
1. Go to Settings
2. Try to add malicious script:
   ```html
   <script src="https://evil.com/hack.js"></script>
   ```
- [ ] Error message shown ✅
- [ ] Only whitelisted domains allowed ✅

### 13. Test Performance Features

#### Test Real-Time Updates
1. Open dashboard in Browser 1
2. Make a test payment in Browser 2
- [ ] Transaction appears in Browser 1 without refresh ✅
- [ ] Toast notification shows ✅

#### Test Caching
1. Open dashboard
2. Click around pages
3. Check Network tab for repeated API calls
- [ ] Tenant data cached (no repeated calls) ✅
- [ ] Cache invalidates on mutations ✅

#### Test Skeleton States
1. Open dashboard in slow 3G throttling
- [ ] Skeleton loading states appear ✅
- [ ] Smooth transition to actual content ✅

#### Test Transaction Limits
1. Check tenant usage stats
2. Verify limit enforcement
- [ ] Usage percentage displayed ✅
- [ ] Warning shown at 90% ✅
- [ ] Transactions blocked at limit ✅

### 14. Test Webhook Retry

Simulate failed webhook:
1. Temporarily break webhook endpoint (add throw new Error())
2. Send test webhook from Stripe
3. Wait 5-10 minutes
4. Fix webhook endpoint
5. Check if retry succeeds

- [ ] Failed webhook saved to `failed_webhooks` table ✅
- [ ] Retry attempted after 5 minutes ✅
- [ ] Successful retry removes from `failed_webhooks` ✅

---

## Monitoring Setup

### 15. Set Up Monitoring Queries

Save these queries in Supabase:

**Failed Webhooks Needing Attention:**
```sql
SELECT * FROM failed_webhooks
WHERE retry_count >= 5
ORDER BY created_at DESC;
```

**Tenants Approaching Limits:**
```sql
SELECT
  id,
  clerk_user_id,
  subscription_plan,
  transaction_limit,
  transactions_used,
  usage_percentage
FROM tenant_usage_stats
WHERE usage_percentage >= 90
ORDER BY usage_percentage DESC;
```

**Recent Webhook Activity:**
```sql
SELECT
  event_type,
  COUNT(*) as count,
  MAX(processed_at) as last_processed
FROM webhook_events
WHERE processed_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY count DESC;
```

- [ ] Monitoring queries saved
- [ ] Dashboard created for key metrics

### 16. Set Up Alerts (Optional)

Consider setting up alerts for:
- [ ] Failed webhooks exceeding max retries
- [ ] Tenants reaching transaction limits
- [ ] Rate limit violations
- [ ] API error rate spikes

---

## Documentation

### 17. Update Team Documentation

Share with team:
- [ ] `docs/IMPLEMENTATION_SUMMARY.md` - Overview of all changes
- [ ] `docs/WEBHOOK_RETRY_SETUP.md` - Webhook retry details
- [ ] `docs/REALTIME_SETUP.md` - Real-time feature setup
- [ ] `docs/CACHING_STRATEGY.md` - Caching implementation
- [ ] `docs/CRON_JOBS_CONFIG.md` - Cron job configuration

---

## Final Verification

### 18. Smoke Test All Features

- [ ] User can sign up/login
- [ ] User can create payment link
- [ ] Customer can complete payment
- [ ] Webhook processes successfully
- [ ] Transaction appears in dashboard
- [ ] Real-time update works
- [ ] Settings page works
- [ ] Hyros script validation works
- [ ] Transaction limits enforce correctly

### 19. Performance Check

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] No memory leaks

---

## 🎉 Launch!

If all checks pass:
- [ ] ✅ Security implemented
- [ ] ✅ Performance optimized
- [ ] ✅ Monitoring active
- [ ] ✅ Documentation complete
- [ ] 🚀 **READY FOR PRODUCTION!**

---

## Rollback Plan (If Needed)

If something goes wrong:

1. **Revert Code:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Database Rollback:**
   - RLS can be disabled per table: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
   - Migrations can be rolled back manually

3. **Disable Cron:**
   - Pause/delete cron job in cron-job.com

4. **Monitor Logs:**
   - Check Vercel logs for errors
   - Check Supabase logs for database issues

---

**Estimated Total Time:** 2-3 hours
**Recommended:** Deploy during low-traffic hours
**Support:** Check documentation in `docs/` folder
