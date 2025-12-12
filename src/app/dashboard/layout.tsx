import { requireAuth } from '@/lib/auth/server-auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  const auth = await requireAuth('/login');
  
  if (!auth) {
    redirect('/login');
  }

  return <>{children}</>;
}
