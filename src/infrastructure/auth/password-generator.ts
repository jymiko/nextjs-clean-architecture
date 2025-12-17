import { randomBytes } from 'crypto';

/**
 * Generate a secure random password that meets the password requirements:
 * - Minimum 6 characters (default 12)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%&*';

  // Ensure minimum length
  const minLength = Math.max(length, 8);

  // Start with at least one of each required character type
  const requiredChars = [
    uppercase[randomBytes(1)[0] % uppercase.length],
    lowercase[randomBytes(1)[0] % lowercase.length],
    numbers[randomBytes(1)[0] % numbers.length],
    special[randomBytes(1)[0] % special.length],
  ];

  // Fill remaining length with random characters from all types
  const allChars = lowercase + uppercase + numbers + special;
  const remainingLength = minLength - requiredChars.length;

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = randomBytes(1)[0] % allChars.length;
    requiredChars.push(allChars[randomIndex]);
  }

  // Shuffle the password using Fisher-Yates algorithm
  for (let i = requiredChars.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
  }

  return requiredChars.join('');
}

/**
 * Generate a secure random token for invitations
 * Uses 32 bytes (256 bits) of randomness, output as 64-character hex string
 */
export function generateInvitationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Calculate token expiry date
 * @param days Number of days until expiry (default 7 days)
 */
export function calculateTokenExpiry(days: number = 7): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
