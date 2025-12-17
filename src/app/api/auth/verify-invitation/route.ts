import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { verifyInvitationTokenSchema } from '@/infrastructure/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        valid: false,
        message: 'No invitation token provided',
      });
    }

    const validatedData = verifyInvitationTokenSchema.parse({ token });
    const invitationRepository = container.cradle.invitationRepository;
    const result = await invitationRepository.verifyToken(validatedData.token);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        valid: false,
        message: error.issues.map(e => e.message).join(', '),
      });
    }

    return NextResponse.json({
      valid: false,
      message: error instanceof Error ? error.message : 'Failed to verify invitation',
    });
  }
}
