import jwt from 'jsonwebtoken';
import { prisma } from '../database';

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export const generateToken = async (payload: JWTPayload): Promise<string> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const token = jwt.sign(payload, secret, { expiresIn: '7d' });

  // Save session to database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      userId: payload.userId,
      token,
      expiresAt,
    },
  });

  return token;
};

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.log('[verifyToken] JWT_SECRET is not defined');
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    // Check if session exists and is not expired
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    console.log('[verifyToken] Session found:', !!session);
    if (session) {
      console.log('[verifyToken] Session expires:', session.expiresAt);
      console.log('[verifyToken] Current time:', new Date());
      console.log('[verifyToken] Session expired:', session.expiresAt < new Date());
    }

    if (!session || session.expiresAt < new Date()) {
      console.log('[verifyToken] Session not found or expired');
      return null;
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    console.log('[verifyToken] JWT decoded successfully:', { userId: decoded.userId, role: decoded.role });
    return decoded;
  } catch (error) {
    console.log('[verifyToken] Error:', error);
    return null;
  }
};

export const revokeToken = async (token: string): Promise<void> => {
  await prisma.session.delete({
    where: { token },
  });
};

export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { userId },
  });
};