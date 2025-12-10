# Webhook Retry Setup

## Overview
The webhook retry system automatically retries failed Stripe webhooks using exponential backoff.

## How It Works

1. **Failed Webhook Capture**: When a webhook fails in `/api/webhooks/stripe`, it's saved to the `failed_webhooks` table
2. **Retry Schedule**: Retries happen at 5min, 15min, 1h, 4h, 24h intervals (max 5 attempts)
3. **Automatic Cleanup**: Successfully retried webhooks are moved to `webhook_events` table and removed from `failed_webhooks`

## Setup Instructions

### 1. Add Environment Variable

Add to your Vercel project or `.env.local`:

```bash
CRON_SECRET=your-random-secret-here
```

Generate a secure random secret:
```bash
openssl rand -base64 32
```

### 2. Configure Vercel Cron (vercel.json)

Create or update `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/webhooks/retry",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes to check for failed webhooks.

### 3. Alternative: Use External Cron Service

If not using Vercel Cron, configure an external service (like cron-job.org or GitHub Actions):

**Endpoint**: `https://your-domain.com/api/webhooks/retry`

**Method**: POST

**Headers**:
```
Authorization: Bearer your-cron-secret-here
```

**Schedule**: Every 5 minutes

## Monitoring Failed Webhooks

### Query Failed Webhooks

```sql
-- View all failed webhooks
SELECT
  event_id,
  event_type,
  retry_count,
  error,
  created_at,
  last_retry_at
FROM failed_webhooks
ORDER BY created_at DESC;

-- View webhooks that exceeded max retries
SELECT
  event_id,
  event_type,
  error,
  created_at
FROM failed_webhooks
WHERE retry_count >= 5
ORDER BY created_at DESC;
```

### Manual Retry

To manually trigger retry process:

```bash
curl -X POST https://your-domain.com/api/webhooks/retry \
  -H "Authorization: Bearer your-cron-secret"
```

## Retry Logic

The system uses exponential backoff:

| Attempt | Delay     |
|---------|-----------|
| 1       | 5 minutes |
| 2       | 15 minutes|
| 3       | 1 hour    |
| 4       | 4 hours   |
| 5       | 24 hours  |

After 5 failed attempts, webhooks remain in the `failed_webhooks` table for manual investigation.

## Troubleshooting

### Webhooks Not Being Retried

1. Check `CRON_SECRET` is set correctly
2. Verify Vercel Cron is configured in `vercel.json`
3. Check logs: `vercel logs --follow`
4. Manually trigger endpoint to test

### High Failure Rate

1. Check Stripe API connectivity
2. Verify Supabase database is accessible
3. Review error messages in `failed_webhooks.error` column
4. Check if tenant data exists for customer IDs

### Clean Up Old Failed Webhooks

```sql
-- Delete failed webhooks older than 7 days that exceeded max retries
DELETE FROM failed_webhooks
WHERE retry_count >= 5
AND created_at < NOW() - INTERVAL '7 days';
```

## Logging

All retry attempts are logged with structured logging:

- `Retrying webhook` - When retry starts
- `Webhook retry successful` - When retry succeeds
- `Webhook retry failed` - When retry fails
- `Webhook retry batch completed` - Summary of batch

View logs in production:
```bash
vercel logs --follow
```
