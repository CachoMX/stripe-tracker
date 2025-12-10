# Caching Strategy

## Overview
The application implements a multi-layer caching strategy to improve performance and reduce unnecessary API calls.

## Cache Implementation

### In-Memory Cache

Located in `lib/cache.ts`, provides a simple TTL-based in-memory cache:

```typescript
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';

// Set cache entry with 5 minute TTL
cache.set('key', data, CacheTTL.MEDIUM);

// Get cache entry (returns null if expired or not found)
const data = cache.get('key');

// Invalidate specific key
cache.invalidate('key');

// Invalidate all keys matching pattern
cache.invalidatePattern('tenant:.*');
```

### Cache TTL Constants

Predefined TTL values for different use cases:

| Constant | Duration | Use Case |
|----------|----------|----------|
| `SHORT` | 1 minute | Frequently changing data |
| `MEDIUM` | 5 minutes | General purpose |
| `LONG` | 15 minutes | Rarely changing data |
| `HOUR` | 60 minutes | Static reference data |

### Cache Keys

Consistent naming convention via `CacheKeys` factory:

```typescript
CacheKeys.tenant(userId)                 // "tenant:{userId}"
CacheKeys.tenantUsage(tenantId)          // "tenant_usage:{tenantId}"
CacheKeys.transactions(tenantId)         // "transactions:{tenantId}"
CacheKeys.paymentLinks(tenantId)         // "payment_links:{tenantId}"
CacheKeys.paymentLinkStats(linkId)       // "payment_link_stats:{linkId}"
```

## Usage Patterns

### 1. Basic Hook Usage

```typescript
import { useCachedData } from '@/hooks/useCachedData';

function MyComponent() {
  const { data, loading, error, refetch } = useCachedData({
    cacheKey: CacheKeys.transactions(tenantId),
    fetcher: async () => {
      const res = await fetch('/api/transactions');
      return res.json();
    },
    ttl: CacheTTL.MEDIUM,
  });

  return <div>{loading ? 'Loading...' : data}</div>;
}
```

### 2. Tenant Data Caching

```typescript
import { useCachedTenant } from '@/hooks/useCachedTenant';

function Dashboard() {
  const { tenant, loading, refetch, invalidateCache } = useCachedTenant();

  const handleUpdate = async () => {
    await updateTenant(data);
    invalidateCache(); // Clear cache after mutation
    await refetch(); // Fetch fresh data
  };

  return <div>{tenant?.email}</div>;
}
```

### 3. Optimistic Updates

```typescript
const { data, mutate } = useCachedData({
  cacheKey: 'my-key',
  fetcher: fetchData,
});

async function handleUpdate(newData) {
  // 1. Update cache immediately (optimistic)
  mutate(newData);

  try {
    // 2. Send to server
    await api.update(newData);
  } catch (error) {
    // 3. Revert on error
    await refetch();
  }
}
```

## Cache Invalidation Strategies

### 1. Time-Based (TTL)

Automatic expiration based on TTL:
```typescript
cache.set('key', data, CacheTTL.MEDIUM); // Expires after 5 minutes
```

### 2. Manual Invalidation

Explicit cache clearing:
```typescript
// Single key
cache.invalidate(CacheKeys.tenant(userId));

// Pattern-based
cache.invalidatePattern('transactions:.*');

// Clear all
cache.clear();
```

### 3. Event-Based Invalidation

Invalidate on specific events:
```typescript
// After mutation
await createPaymentLink(data);
cache.invalidate(CacheKeys.paymentLinks(tenantId));

// On real-time update
supabase
  .channel('transactions')
  .on('INSERT', () => {
    cache.invalidate(CacheKeys.transactions(tenantId));
  })
  .subscribe();
```

## Caching Best Practices

### 1. Choose Appropriate TTL

```typescript
// User profile - changes rarely
cache.set(CacheKeys.tenant(userId), tenant, CacheTTL.LONG);

// Transaction count - changes frequently
cache.set(CacheKeys.transactions(tenantId), txns, CacheTTL.SHORT);

// Static reference data
cache.set('pricing-plans', plans, CacheTTL.HOUR);
```

### 2. Cache at the Right Layer

- **Component Level**: Use hooks for component-specific data
- **Global Level**: Use context for app-wide data (user, tenant)
- **API Level**: Cache API responses to prevent duplicate requests

### 3. Invalidate Strategically

```typescript
// ❌ Bad - Over-invalidation
async function updateName(name) {
  await api.updateName(name);
  cache.clear(); // Clears everything!
}

// ✅ Good - Targeted invalidation
async function updateName(name) {
  await api.updateName(name);
  cache.invalidate(CacheKeys.tenant(userId));
}
```

### 4. Handle Stale Data

```typescript
// Show cached data immediately, fetch fresh in background
const { data, loading, refetch } = useCachedData({
  cacheKey: 'my-key',
  fetcher: fetchData,
});

useEffect(() => {
  // Refetch fresh data on mount
  if (data) {
    refetch();
  }
}, []);

return (
  <div>
    {data} {loading && <span>Updating...</span>}
  </div>
);
```

## Integration with Real-Time Updates

Combine caching with Supabase Realtime for optimal performance:

```typescript
function TransactionsList() {
  // Initial load from cache
  const { data, mutate } = useCachedData({
    cacheKey: CacheKeys.transactions(tenantId),
    fetcher: fetchTransactions,
  });

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('transactions')
      .on('INSERT', (payload) => {
        // Update cache with new transaction
        mutate([payload.new, ...(data || [])]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data, mutate]);

  return <TransactionTable data={data} />;
}
```

## Performance Metrics

Track cache effectiveness:

```typescript
// Get cache statistics
const stats = cache.stats();
console.log('Cache size:', stats.size);
console.log('Cached keys:', stats.keys);

// Calculate hit rate
let hits = 0;
let misses = 0;

function getCached(key) {
  const data = cache.get(key);
  if (data) hits++;
  else misses++;
  return data;
}

const hitRate = (hits / (hits + misses)) * 100;
console.log(`Cache hit rate: ${hitRate.toFixed(2)}%`);
```

## Troubleshooting

### Cache Not Working

1. **Check TTL**: Ensure TTL is not too short
2. **Check Key**: Verify cache key is consistent
3. **Check Invalidation**: Look for over-aggressive invalidation

### Stale Data Issues

1. **Lower TTL**: Reduce cache duration
2. **Add Manual Invalidation**: Clear cache on mutations
3. **Use Real-Time**: Combine with Supabase Realtime

### Memory Concerns

1. **Limit Cache Size**: Implement max size in cache class
2. **Use Shorter TTLs**: Entries expire faster
3. **Clear Periodically**: Call `cache.clear()` on logout

## Future Enhancements

- [ ] Implement LRU (Least Recently Used) eviction policy
- [ ] Add persistent cache with IndexedDB
- [ ] Implement cache warming on app load
- [ ] Add cache metrics and monitoring
- [ ] Implement request deduplication
- [ ] Add cache compression for large datasets
