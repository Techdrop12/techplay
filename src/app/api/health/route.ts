/**
 * Health check for load balancers, monitoring and runbooks.
 * GET /api/health → 200 + { status, version, env } (no sensitive data).
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const body = {
    status: 'ok',
    version: process.env.npm_package_version ?? '1.0.0',
    env: process.env.NODE_ENV ?? 'development',
  };
  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, private, max-age=0',
    },
  });
}
