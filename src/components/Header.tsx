'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { tokenManager } from '@/lib/auth/token-manager';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Users, Building, Briefcase, User } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  lastLogin?: string;
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Function to format the last login date
  const formatLastLogin = (lastLoginDate: string) => {
    const date = new Date(lastLoginDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Active today';
    } else if (diffDays === 1) {
      return 'Active 1 day ago';
    } else {
      return `Active ${diffDays} days ago`;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = tokenManager.getAccessToken();
        if (!token) {
          setLoading(false);
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
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await tokenManager.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login even if logout API fails
      router.push('/login');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await tokenManager.logout(true); // logout from all devices
      router.push('/login');
    } catch (error) {
      console.error('Logout from all devices failed:', error);
      // Still redirect to login even if logout API fails
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Gacoan DCMS
            </h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white dark:bg-zinc-900 shadow-sm border-b">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1
              className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer"
              onClick={() => router.push('/')}
            >
              Gacoan DCMS
            </h1>

            {/* Navigation Menu */}
            {user && (
              <nav className="hidden md:flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`flex items-center gap-2 ${pathname?.includes('/profiles') ? 'bg-gray-100' : ''}`}
                    >
                      <User className="w-4 h-4" />
                      Profiles
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => router.push('/profiles')} className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profiles/departments')} className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Departments
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profiles/positions')} className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Positions
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              {/* Login as text */}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Login as
              </p>

              {/* User card matching Figma design */}
              <div className="bg-[#f6faff] dark:bg-zinc-800 h-[40px] rounded-lg px-3 py-1 flex items-center gap-2 min-w-[120px]">
                {/* Avatar placeholder - you can replace with actual avatar if available */}
                <div className="w-6 h-6 bg-[#4db1d4] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#243644] dark:text-white">
                    {user.name || user.email}
                  </span>
                  {user.lastLogin && (
                    <span className="text-xs text-[#a4b4c8] dark:text-gray-400">
                      {formatLastLogin(user.lastLogin)}
                    </span>
                  )}
                </div>
              </div>

              {/* Logout buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogoutAll}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  All Devices
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}