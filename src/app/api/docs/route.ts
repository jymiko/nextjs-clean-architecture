import { NextResponse } from 'next/server';
import { openApiSpec } from '@/infrastructure/openapi';

export async function GET() {
  return NextResponse.json(openApiSpec);
}
