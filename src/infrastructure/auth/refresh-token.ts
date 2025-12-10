import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../database';
import { JWTPayload } from './jwt';

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateRefreshToken = async (
  userId: string,
  deviceId?: string
): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Set expiration to 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Store in database
  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      tokenHash,
      expiresAt,
      deviceId,
    },
  });

  return token;
};

export const verifyRefreshToken = async (
  token: string
): Promise<RefreshTokenPayload | null> => {
  try {
    // Calculate hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Check if refresh token exists and is not expired
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
      return null;
    }

    if (!refreshTokenRecord.user.isActive) {
      return null;
    }

    return {
      userId: refreshTokenRecord.userId,
      tokenId: refreshTokenRecord.id,
    };
  } catch (error) {
    return null;
  }
};

export const rotateRefreshToken = async (
  oldToken: string,
  deviceId?: string
): Promise<string | null> => {
  try {
    const tokenHash = crypto.createHash('sha256').update(oldToken).digest('hex');

    // Get the old refresh token record
    const oldRefreshToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!oldRefreshToken || oldRefreshToken.expiresAt < new Date()) {
      return null;
    }

    // Delete the old refresh token
    await prisma.refreshToken.delete({
      where: { id: oldRefreshToken.id },
    });

    // Generate a new refresh token
    const newToken = await generateRefreshToken(
      oldRefreshToken.userId,
      deviceId
    );

    return newToken;
  } catch (error) {
    return null;
  }
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  await prisma.refreshToken.deleteMany({
    where: { tokenHash },
  });
};

export const revokeAllUserRefreshTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

export const generateTokenPair = async (
  payload: JWTPayload,
  deviceId?: string
): Promise<TokenPair> => {
  // Generate access token (short-lived)
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

  // Save session to database
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  await prisma.session.create({
    data: {
      userId: payload.userId,
      token: accessToken,
      expiresAt,
      deviceId,
    },
  });

  // Generate refresh token (long-lived)
  const refreshToken = await generateRefreshToken(payload.userId, deviceId);

  return {
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (
  refreshToken: string,
  deviceId?: string
): Promise<TokenPair | null> => {
  try {
    // Verify the refresh token
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (!refreshPayload) {
      return null;
    }

    // Get user details for new access token
    const user = await prisma.user.findUnique({
      where: { id: refreshPayload.userId },
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Create new JWT payload
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    // Generate new access token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const accessToken = jwt.sign(jwtPayload, secret, { expiresIn: '15min' });

    // Save new session to database
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        expiresAt,
        deviceId,
      },
    });

    // Rotate the refresh token
    const newRefreshToken = await rotateRefreshToken(refreshToken, deviceId);

    if (!newRefreshToken) {
      // If rotation fails, still return the access token
      return {
        accessToken,
        refreshToken, // Return the old one
      };
    }

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    return null;
  }
};

// Clean up expired tokens
export const cleanupExpiredTokens = async (): Promise<void> => {
  const now = new Date();

  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });
};