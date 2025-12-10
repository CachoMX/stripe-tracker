# Cron-Job.com Configuration

## Webhook Retry Job Setup

Since you're using cron-job.com instead of Vercel Cron, follow these steps:

### 1. Create the Cron Job

Go to [cron-job.com](https://cron-job.com) and create a new cron job with these settings:

**Basic Settings:**
- **Title:** Ping It Now - Webhook Retry
- **Address (URL):** `https://your-domain.vercel.app/api/webhooks/retry`
- **Schedule:** Every 5 minutes
  - Pattern: `*/5 * * * *`

**Request Settings:**
- **Request Method:** POST
- **Request Type:** Default (application/x-www-form-urlencoded)

**Headers:**
Add custom header:
```
Authorization: Bearer YOUR_CRON_SECRET_HERE
```

**Advanced Settings:**
- **Execution schedule:** Enabled
- **Save responses:** Yes (for debugging)
- **Timeout:** 30 seconds
- **Notifications:**
  - ✅ Notify on failure after 3 consecutive failures

### 2. Generate CRON_SECRET

On Windows (PowerShell):
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Or use online tool: https://generate-secret.vercel.app/32

### 3. Add to Environment Variables

Add to Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** (paste the generated secret)
   - **Environments:** Production, Preview, Development

### 4. Test the Endpoint

Test manually with curl:

**Windows (PowerShell):**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_CRON_SECRET"
}

Invoke-WebRequest -Uri "https://your-domain.vercel.app/api/webhooks/retry" `
    -Method POST `
    -Headers $headers
```

**Or using curl:**
```bash
curl -X POST https://your-domain.vercel.app/api/webhooks/retry \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
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

### 5. Remove Vercel Cron Config

Since you're not using Vercel Cron, you can remove `vercel.json`:

```bash
# Delete the file
rm vercel.json
```

Or comment it out if you want to keep it for reference.

## Monitoring

### View Execution History

In cron-job.com dashboard:
1. Go to "Jobs" → Your job
2. Click "History" tab
3. View execution logs and responses

### Check Failed Webhooks

Query your database:
```sql
-- View recent retry activity
SELECT
  event_id,
  event_type,
  retry_count,
  error,
  last_retry_at
FROM failed_webhooks
ORDER BY last_retry_at DESC
LIMIT 20;
```

### Success Metrics

After running for a while, check:
```sql
-- Count successful retries (removed from failed_webhooks)
SELECT COUNT(*) FROM webhook_events
WHERE processed_at > NOW() - INTERVAL '1 day';

-- Count pending retries
SELECT
  retry_count,
  COUNT(*) as count
FROM failed_webhooks
GROUP BY retry_count
ORDER BY retry_count;
```

## Troubleshooting

### "Unauthorized" Error

- Check CRON_SECRET matches in both cron-job.com and Vercel
- Ensure Authorization header format is exactly: `Bearer YOUR_SECRET`
- Check Vercel logs for the actual error

### "No webhooks to retry"

This is normal if:
- No webhooks have failed
- All failed webhooks have been successfully retried
- You're in development/testing

### Cron Job Failing

1. **Check URL:** Ensure it points to your production domain
2. **Check Headers:** Verify Authorization header is set
3. **Check Timeout:** Increase to 60 seconds if retrying many webhooks
4. **Check Logs:** View response in cron-job.com history

## Alternative: Use GitHub Actions

If you prefer, you can use GitHub Actions instead:

Create `.github/workflows/webhook-retry.yml`:

```yaml
name: Webhook Retry Cron

on:
  schedule:
    # Runs every 5 minutes
    - cron: '*/5 * * * *'
  workflow_dispatch: # Manual trigger

jobs:
  retry-webhooks:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger webhook retry
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/webhooks/retry \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add secrets in GitHub:
- `APP_URL`: Your production URL
- `CRON_SECRET`: Your cron secret

## Cost Comparison

| Service | Free Tier | Paid |
|---------|-----------|------|
| cron-job.com | 3 jobs, 1 min interval | €3.99/month for unlimited |
| Vercel Cron | Included in Pro ($20/month) | - |
| GitHub Actions | 2,000 min/month | $0.008/min after |

For this use case:
- **cron-job.com:** ✅ Best for hobby/small projects
- **Vercel Cron:** Best if already on Pro plan
- **GitHub Actions:** Best if already using GitHub

## Next Steps After Setup

1. ✅ Configure cron job in cron-job.com
2. ✅ Add CRON_SECRET to Vercel
3. ✅ Test endpoint manually
4. ✅ Delete or comment out vercel.json
5. ✅ Monitor first few executions
6. 🚀 You're done!
