'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Image from 'next/image';
import tokenManager from '@/lib/auth/token-manager';
import apiClient from '@/lib/api-client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useLastAccounts } from '@/hooks/use-last-accounts';
import { LastAccountCard } from '@/components/auth/last-account-card';
import { clearAuthCookies } from '@/lib/cookies';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { accounts, saveAccount, removeAccount } = useLastAccounts();

  useEffect(() => {
    // Only check auth if we have tokens, otherwise clear and stay on login
    const tokens = tokenManager.getTokens();
    
    if (!tokens || !tokens.accessToken) {
      // No tokens, clear any stale data and stay on login
      tokenManager.clearTokens();
      clearAuthCookies();
      return;
    }
    
    // We have tokens, verify they're still valid
    const checkAuth = async () => {
      try {
        const response = await apiClient.get('/api/auth/me');
        if (response) {
          // Valid session, redirect to home
          router.push('/');
        }
      } catch {
        // Invalid tokens, clear them
        tokenManager.clearTokens();
        clearAuthCookies();
      }
    };
    
    checkAuth();
  }, [router]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSelectAccount = (email: string) => {
    // Clear any existing error
    setError(null);
    // Pre-fill the email field
    form.setValue('email', email);
    // Clear the password field
    form.setValue('password', '');
    // Focus on password field
    const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;
    if (passwordField) {
      passwordField.focus();
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/auth/login', data, {
        skipAuth: true,
      });

      // Save account info to last accounts
      saveAccount(response.user.email, response.user.name, response.user.avatar);

      // Extract token data from response
      const tokenData = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
        tokenType: response.tokenType,
      };

      // Initialize tokens and redirect
      tokenManager.initializeTokens(tokenData);

      // Show success toast
      toast.success(`Login berhasil! Selamat datang, ${response.user.name}`, {
        duration: 2000,
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      // Clear any tokens/cookies on login failure
      tokenManager.clearTokens();
      clearAuthCookies();
      
      let errorMessage = 'Login gagal. Periksa kembali email dan password Anda.';

      // Handle specific error cases
      if (err.message) {
        if (err.message.includes('Invalid credentials')) {
          errorMessage = 'Email atau password salah.';
        } else if (err.message.includes('Validation Error')) {
          errorMessage = 'Format input tidak valid.';
        } else if (err.message.includes('Too many requests')) {
          errorMessage = 'Terlalu banyak percobaan login. Coba lagi nanti.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Blue Background - Top Half */}
      <div className="absolute top-0 left-0 right-0 h-[50%] bg-[#4DB1D4]" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center px-16">
        {/* Left Side - Text Content */}
        <div className="flex-1 self-start pt-48 flex flex-col items-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-semibold text-white mb-2">
              Sign in to
            </h1>
            <h2 className="text-xl font-medium text-white mb-6">
              Document Control Management System
            </h2>
            <p className="text-base text-white/90 leading-relaxed text-justify">
              Document Control Management System (DCMS) is a centralized platform that standardizes the creation, distribution, revision, and archiving of documents across departments. It ensures version accuracy, approval transparency, and easy tracking, helping organizations maintain compliance and operational efficiency.
            </p>
          </div>

          {/* Login as section */}
          {accounts.length > 0 && (
            <div className="mt-32">
              <p className="text-base text-[#243644] mb-4">
                Login as
              </p>
              <div className="flex gap-4 flex-wrap">
                {accounts.map((account) => (
                  <LastAccountCard
                    key={account.email}
                    account={account}
                    onSelect={handleSelectAccount}
                    onRemove={removeAccount}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-xl">
            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#4DB1D4] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <div>
                  <p className="font-semibold text-base text-[#243644]">DCMS</p>
                  <p className="text-base text-[#E91E8C]">
                    <span className="italic">Gacoan</span> Mie Gacoan
                  </p>
                </div>
              </div>

              {/* Welcome */}
              <div className="mb-6">
                <p className="text-base text-[#243644] mb-1">
                  Welcome to <span className="font-semibold text-[#00B3D8]">DCMS</span>
                </p>
                <h2 className="text-2xl font-semibold text-[#243644]">Sign in</h2>
              </div>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base text-gray-500">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Email"
                            className="h-12 bg-white border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus:border-[#00B3D8] transition-colors"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base text-gray-500">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Password"
                              className="h-12 bg-white border-0 border-b border-gray-200 rounded-none pr-10 focus-visible:ring-0 focus:border-[#00B3D8] transition-colors"
                              disabled={isLoading}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox className="border-gray-300 data-[state=checked]:bg-[#4DB1D4]" />
                      <span className="text-base text-gray-600">Remember me</span>
                    </label>
                    <a href="/forgot-password" className="text-base text-[#00B3D8] hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#4DB1D4] hover:bg-[#3da0c3] text-white font-medium rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-base text-gray-500">
              <p>© 2024 Mie Gacoan. All rights reserved.</p>
              <p>Version 2.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}