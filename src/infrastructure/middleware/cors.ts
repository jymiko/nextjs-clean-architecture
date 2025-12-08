import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://yourdomain.com', // Add your production domain here
];

export const corsMiddleware = (request: NextRequest) => {
  const origin = request.headers.get('origin');

  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    const response = NextResponse.next();

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  }

  // For requests without origin or non-allowed origins
  return NextResponse.next();
};

export const handleOptions = (request: NextRequest) => {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });

    const origin = request.headers.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  }

  return null;
};