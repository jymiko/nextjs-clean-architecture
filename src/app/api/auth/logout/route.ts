import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { handleError, UnauthorizedError } from "@/infrastructure/errors";
import { withAuth } from "@/infrastructure/middleware";
import { revokeToken } from "@/infrastructure/auth";
import { revokeAllUserRefreshTokens } from "@/infrastructure/auth/refresh-token";
import { prisma } from "@/infrastructure/database";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No token provided
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authenticatedRequest = await withAuth(request);

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7);
    const userId = authenticatedRequest.user?.id;

    // Check if logout all devices is requested
    const body = await request.json().catch(() => ({}));
    const logoutAll = body.logoutAll || false;

    if (logoutAll && userId) {
      // Revoke all tokens for the user
      await prisma.session.deleteMany({
        where: { userId },
      });
      await revokeAllUserRefreshTokens(userId);
    } else {
      // Revoke only the current access token
      await revokeToken(token);
    }

    return NextResponse.json({
      message: logoutAll ? "Logged out from all devices successfully" : "Logged out successfully"
    });
  } catch (error) {
    return handleError(error, request);
  }
}