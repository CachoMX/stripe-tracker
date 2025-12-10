'use client';

import { useEffect, useState, useCallback } from 'react';
import { cache, CacheTTL } from '@/lib/cache';

interface UseCachedDataOptions<T> {
  cacheKey: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
}

export function useCachedData<T>({
  cacheKey,
  fetcher,
  ttl = CacheTTL.MEDIUM,
  enabled = true,
}: UseCachedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (useCache = true) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      // Check cache first if enabled
      if (useCache) {
        const cached = cache.get<T>(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      setLoading(true);
      const result = await fetcher();

      // Cache the result
      cache.set(cacheKey, result, ttl);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetcher, ttl, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.invalidate(cacheKey);
  }, [cacheKey]);

  const mutate = useCallback((newData: T) => {
    cache.set(cacheKey, newData, ttl);
    setData(newData);
  }, [cacheKey, ttl]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    mutate,
  };
}
