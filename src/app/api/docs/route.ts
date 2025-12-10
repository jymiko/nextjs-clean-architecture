import { NextResponse } from 'next/server';
import { openApiSpec } from '@/infrastructure/openapi';

export async function GET() {
  // Add cache control headers to prevent browser caching
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  return new NextResponse(JSON.stringify(openApiSpec, null, 2), {
    status: 200,
    headers
  });
}
