import { NextRequest, NextResponse } from 'next/server';
import { getUserFriendlyMessage } from '@/infrastructure/errors/user-friendly-messages';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: getUserFriendlyMessage('Not found') },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: getUserFriendlyMessage('Not found') },
    { status: 404 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: getUserFriendlyMessage('Not found') },
    { status: 404 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: getUserFriendlyMessage('Not found') },
    { status: 404 }
  );
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { error: getUserFriendlyMessage('Not found') },
    { status: 404 }
  );
}