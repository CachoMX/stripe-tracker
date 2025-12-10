/**
 * Simple in-memory cache with TTL (Time To Live)
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

class Cache {
  private store: Map<string, CacheEntry<any>>;

  constructor() {
    this.store = new Map();
  }

  /**
   * Set a cache entry with TTL
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get a cache entry if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      // Entry expired, remove it
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove a specific cache entry
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Remove all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Singleton instance
export const cache = new Cache();

/**
 * Cache keys factory for consistent naming
 */
export const CacheKeys = {
  tenant: (userId: string) => `tenant:${userId}`,
  tenantUsage: (tenantId: string) => `tenant_usage:${tenantId}`,
  transactions: (tenantId: string) => `transactions:${tenantId}`,
  paymentLinks: (tenantId: string) => `payment_links:${tenantId}`,
  paymentLinkStats: (linkId: string) => `payment_link_stats:${linkId}`,
} as const;

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  HOUR: 60 * 60 * 1000, // 1 hour
} as const;
