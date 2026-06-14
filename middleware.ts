// ============================================================================
// Wuwa Archive — Rate Limiting Middleware
// Protects import API endpoints from abuse
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limit store (per Vercel serverless instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 30 * 60 * 1000;  // 30 minutes
const MAX_REQUESTS = 5;            // Max 5 import requests per window (per TSD)

export function middleware(request: NextRequest) {
  // Only rate-limit import API endpoints
  if (!request.nextUrl.pathname.startsWith('/api/v1/import')) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Reset if window has expired
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  // Check limit
  if (record.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: 'RATE_LIMITED',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    );
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/import/:path*',
};
