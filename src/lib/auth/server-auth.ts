import { cookies } from 'next/headers';
import { verifyToken } from '@/infrastructure/auth';
import { redirect } from 'next/navigation';

export async function getServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  console.log('[ServerAuth] Checking auth, token exists:', !!token);

  if (!token) {
    console.log('[ServerAuth] No auth-token cookie found');
    return null;
  }

  try {
    const payload = await verifyToken(token);
    console.log('[ServerAuth] Token verification result:', payload ? 'valid' : 'invalid');
    return payload;
  } catch (error) {
    console.log('[ServerAuth] Token verification error:', error);
    return null;
  }
}

export async function requireAuth(redirectTo: string = '/login') {
  const auth = await getServerAuth();
  
  if (!auth) {
    redirect(redirectTo);
  }
  
  return auth;
}

export async function checkAuth() {
  const auth = await getServerAuth();
  return !!auth;
}
