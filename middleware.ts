import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting
// For production, consider using Redis (@upstash/ratelimit)
const rateLimit = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMITS = {
  '/api/webhooks': 100, // Webhooks can be frequent
  '/api/payment-links': 20,
  '/api/create-subscription': 10,
  '/api/create-checkout': 20,
  '/api': 100, // Default for other API routes
};

function getRateLimit(pathname: string): number {
  for (const [path, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) {
      return limit;
    }
  }
  return 100; // Default
}

function checkRateLimit(ip: string, pathname: string): boolean {
  const now = Date.now();
  const maxRequests = getRateLimit(pathname);

  // Get or create request history for this IP + path combination
  const key = `${ip}:${pathname}`;
  if (!rateLimit.has(key)) {
    rateLimit.set(key, []);
  }

  const requests = rateLimit.get(key)!;

  // Filter out requests outside the window
  const recentRequests = requests.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  // Add current request
  recentRequests.push(now);
  rateLimit.set(key, recentRequests);

  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupOldEntries();
  }

  return true;
}

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, requests] of rateLimit.entries()) {
    const recentRequests = requests.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
    if (recentRequests.length === 0) {
      rateLimit.delete(key);
    } else {
      rateLimit.set(key, recentRequests);
    }
  }
}

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = (request as any).ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';

    if (!checkRateLimit(ip, request.nextUrl.pathname)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
