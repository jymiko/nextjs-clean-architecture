import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import * as yaml from 'js-yaml';

// GET /api/docs - Return OpenAPI specification
export async function GET(request: NextRequest) {
  try {
    // Read the OpenAPI YAML file
    const filePath = join(process.cwd(), 'docs', 'document-control-api.yaml');
    const fileContents = await readFile(filePath, 'utf8');

    // Parse YAML to JSON
    const spec = yaml.load(fileContents) as any;

    // Add cache control headers to prevent browser caching
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    return new NextResponse(JSON.stringify(spec, null, 2), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error reading OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'Documentation not available' },
      { status: 404 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
