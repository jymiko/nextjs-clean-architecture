'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Users, Building, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tokenManager } from '@/lib/auth/token-manager';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  lastLogin?: string;
}

export default function ProfilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = tokenManager.getAccessToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    {
      name: 'Users',
      href: '/profiles',
      icon: Users,
      current: pathname === '/profiles',
    },
    {
      name: 'Departments',
      href: '/profiles/departments',
      icon: Building,
      current: pathname === '/profiles/departments',
    },
    {
      name: 'Positions',
      href: '/profiles/positions',
      icon: Briefcase,
      current: pathname === '/profiles/positions',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => router.push(tab.href)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    tab.current
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon
                    className={`mr-2 h-5 w-5 ${
                      tab.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}