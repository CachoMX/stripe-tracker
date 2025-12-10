# Supabase Realtime Setup

## Overview
The application uses Supabase Realtime to provide live updates for transactions and payment links without requiring page refreshes.

## Enable Realtime in Supabase

### 1. Enable Realtime for Tables

In your Supabase dashboard:

1. Go to **Database** → **Replication**
2. Find the following tables and enable replication:
   - `transactions`
   - `payment_links`
   - `tenants` (optional, for subscription status updates)

Or run this SQL:

```sql
-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Enable realtime for payment_links
ALTER PUBLICATION supabase_realtime ADD TABLE payment_links;

-- Enable realtime for tenants (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE tenants;
```

### 2. Configure RLS for Realtime

Realtime respects Row Level Security (RLS) policies. Since we already have RLS enabled, users will only receive updates for their own tenant's data.

Verify RLS is enabled:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('transactions', 'payment_links', 'tenants');
```

## Usage in Components

### Using the Realtime Hooks

```tsx
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';
import { useRealtimePaymentLinks } from '@/hooks/useRealtimePaymentLinks';

function MyComponent() {
  const { transactions, loading } = useRealtimeTransactions(tenantId);
  const { paymentLinks, loading: linksLoading } = useRealtimePaymentLinks(tenantId);

  // transactions and paymentLinks will automatically update in real-time
  return (
    <div>
      {transactions.map(t => <div key={t.id}>{t.customer_email}</div>)}
    </div>
  );
}
```

### Adding Realtime Notifications

Add to your dashboard layout:

```tsx
import RealtimeNotifications from '@/components/RealtimeNotifications';

export default function DashboardLayout({ children }) {
  const [tenantId, setTenantId] = useState(null);

  // ... fetch tenantId ...

  return (
    <>
      <RealtimeNotifications tenantId={tenantId} />
      {children}
    </>
  );
}
```

## How It Works

### 1. Subscription Setup

The hooks create a Realtime channel for each tenant:

```typescript
const channel = supabase
  .channel(`transactions:${tenantId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'transactions',
    filter: `tenant_id=eq.${tenantId}`,
  }, (payload) => {
    // Update local state with new transaction
  })
  .subscribe();
```

### 2. Event Types

Three event types are supported:
- **INSERT**: New records added
- **UPDATE**: Existing records modified
- **DELETE**: Records removed

### 3. Filtering

The `filter` parameter ensures users only receive updates for their own tenant:
```typescript
filter: `tenant_id=eq.${tenantId}`
```

### 4. Cleanup

Channels are automatically unsubscribed when components unmount:
```typescript
return () => {
  supabase.removeChannel(channel);
};
```

## Performance Considerations

### Connection Limits

Supabase has connection limits:
- **Free tier**: 200 concurrent connections
- **Pro tier**: 500+ concurrent connections

Each user consumes 1-3 connections depending on active subscriptions.

### Optimization Tips

1. **Consolidate Channels**: Instead of multiple channels per table, use one channel with multiple event listeners:

```typescript
const channel = supabase
  .channel(`tenant:${tenantId}`)
  .on('postgres_changes', { table: 'transactions', ... }, handler1)
  .on('postgres_changes', { table: 'payment_links', ... }, handler2)
  .subscribe();
```

2. **Filter Server-Side**: Always use filters to reduce payload size:
```typescript
filter: `tenant_id=eq.${tenantId}`
```

3. **Cleanup Properly**: Always unsubscribe in cleanup functions to prevent memory leaks.

## Testing Realtime

### Test New Transactions

1. Open dashboard in browser
2. In another tab, make a test payment
3. Watch transaction appear in real-time without refresh

### Test with Multiple Tabs

1. Open dashboard in two browser tabs
2. Create a payment link in one tab
3. Verify it appears in both tabs instantly

### Debugging

Check realtime connection status:
```typescript
channel.on('system', {}, (payload) => {
  console.log('Channel status:', payload);
});
```

View active subscriptions:
```typescript
const channels = supabase.getChannels();
console.log('Active channels:', channels);
```

## Troubleshooting

### Realtime Not Working

1. **Check Replication**: Verify tables have replication enabled in Supabase dashboard
2. **Check RLS**: Ensure RLS policies allow SELECT for the user
3. **Check Filters**: Verify `tenant_id` filter matches exactly
4. **Check Console**: Look for WebSocket errors in browser console

### High Connection Usage

1. Consolidate multiple channels into one
2. Only subscribe on pages that need real-time data
3. Ensure proper cleanup when components unmount

### Delayed Updates

1. Check network latency
2. Verify Supabase region is close to users
3. Consider upgrading to Pro tier for better performance

## Future Enhancements

- Add presence tracking to show who's online
- Implement collaborative features (e.g., multiple users viewing same data)
- Add broadcast messages for cross-user notifications
- Implement optimistic UI updates with rollback on error
