import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { withAuthHandler } from '@/infrastructure/middleware/auth';

export const POST = withAuthHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;

      const invitationRepository = container.cradle.invitationRepository;
      const result = await invitationRepository.resendInvitation(id);

      return NextResponse.json(result);
    } catch (error) {
      return handleError(error, request);
    }
  },
  { allowedRoles: ['ADMIN'] }
);
