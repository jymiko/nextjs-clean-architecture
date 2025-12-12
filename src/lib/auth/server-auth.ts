import { cookies } from 'next/headers';
import { verifyToken } from '@/infrastructure/auth';
import { redirect } from 'next/navigation';

export async function getServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);
    return payload;
  } catch {
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
