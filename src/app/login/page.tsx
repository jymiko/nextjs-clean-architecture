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
import { useLastAccounts, REMEMBER_ME_SESSION_KEY } from '@/hooks/use-last-accounts';
import { LastAccountCard } from '@/components/auth/last-account-card';
import { clearAuthCookies } from '@/lib/cookies';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { accounts, removeAccount } = useLastAccounts();

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
          // Valid session, redirect to dashboard
          router.push('/dashboard');
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
      rememberMe: false,
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
      const response = await apiClient.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      }, {
        skipAuth: true,
      });

      // If Remember Me is checked, save session data for logout to use later
      if (data.rememberMe) {
        sessionStorage.setItem(REMEMBER_ME_SESSION_KEY, JSON.stringify({
          email: response.user.email,
          name: response.user.name,
          avatar: response.user.avatar,
          rememberMe: true,
        }));
      } else {
        // Clear any existing session data if Remember Me is not checked
        sessionStorage.removeItem(REMEMBER_ME_SESSION_KEY);
      }

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
        router.push('/dashboard');
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
    <div className="min-h-screen w-full bg-white relative overflow-x-hidden">
      {/* Blue Background - 50% viewport height on desktop */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] sm:h-[45vh] lg:h-[50vh] bg-[#4DB1D4]" />

      {/* Desktop Layout (lg+) - Absolute positioning */}
      <div className="hidden lg:block relative min-h-screen">
        {/* Left Side Text - Fixed position */}
        <div className="absolute left-[86px] top-[80px] w-[513px]">
          <div className="flex flex-col gap-[10px] mb-[25px]">
            <h1 className="text-[24px] font-semibold text-white">
              Sign in to
            </h1>
            <h2 className="text-[20px] font-medium text-white">
              Document Control Management System
            </h2>
          </div>
          <p className="text-[14px] text-white leading-normal text-justify">
            Document Control Management System (DCMS) is a centralized platform that standardizes the creation, distribution, revision, and archiving of documents across departments. It ensures version accuracy, approval transparency, and easy tracking, helping organizations maintain compliance and operational efficiency.
          </p>
        </div>

        {/* Login as section - Below Blue Area */}
        {accounts.length > 0 && (
          <div className="absolute left-[86px] top-[calc(50vh+40px)]">
            <p className="text-[16px] text-[#243644] mb-[50px]">
              Login as
            </p>
            <div className="flex gap-[31px]">
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

        {/* Login Form - Fixed position, vertically centered */}
        <div className="absolute right-[116px] top-1/2 -translate-y-1/2 w-[508px]">
          <div className="flex flex-col gap-[30px] items-center">
            {/* Form Card */}
            <div className="bg-white rounded-[25px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] border border-[#ff3fb1] p-[34px] w-full overflow-hidden">
              <div className="flex flex-col gap-[40px] w-full">
                {/* Logo */}
                <div className="flex gap-[10px] items-center">
                  <div className="w-[43px] h-[31px] relative overflow-hidden">
                    <img
                      src="/gacoan-logo.png"
                      alt="Gacoan Logo"
                      className="absolute h-[193%] left-[-20%] top-[-40%] w-[139%] max-w-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-[13px] text-[#243644]">DCMS</p>
                    <p className="text-[10px] font-medium text-[#738193]">Mie Gacoan</p>
                  </div>
                </div>

                {/* Welcome */}
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[16px] font-medium text-[#243644] leading-[24px]">
                    Welcome to <span className="font-semibold text-[#00B3D8]">DCMS</span>
                  </p>
                  <h2 className="text-[24px] font-medium text-[#243644] leading-[24px]">Sign in</h2>
                </div>

                {/* Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-[15px] w-full">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col gap-[15px] w-full">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Email"
                                className="h-[40px] border-0 border-b border-[#00b3d8] rounded-none px-3 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
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
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Password"
                                  className="h-[40px] border-0 border-b border-[#00b3d8] rounded-none px-3 pr-10 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00b3d8] hover:text-[#00a0c0] transition-colors"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-[5px] space-y-0">
                            <FormControl>
                              <Checkbox
                                className="h-6 w-6 border-[#00b3d8] data-[state=checked]:bg-[#4DB1D4] data-[state=checked]:border-[#4DB1D4]"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-[12px] font-medium text-[#243644] leading-[24px] cursor-pointer">
                              Remember me
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <a href="/forgot-password" className="text-[12px] font-medium text-[#00B3D8] leading-[24px] hover:underline">
                        Forgot password?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-[44px] bg-[#4DB1D4] hover:bg-[#3da0c3] text-white font-semibold text-[14px] rounded-[8px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)]"
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
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-[4px] items-center text-center text-[12px] text-[#6a7282] leading-[20px]">
              <p>© 2024 Mie Gacoan. All rights reserved.</p>
              <p>Version 2.1.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout (below lg) */}
      <div className="lg:hidden relative z-10 min-h-screen flex flex-col">
        {/* Header Text - In Blue Area */}
        <div className="px-6 sm:px-8 pt-8 sm:pt-12 max-w-[513px]">
          <div className="flex flex-col gap-[10px] mb-[20px]">
            <h1 className="text-[20px] sm:text-[24px] font-semibold text-white">
              Sign in to
            </h1>
            <h2 className="text-[16px] sm:text-[20px] font-medium text-white">
              Document Control Management System
            </h2>
          </div>
          <p className="text-[13px] sm:text-[14px] text-white leading-normal text-justify hidden sm:block">
            Document Control Management System (DCMS) is a centralized platform that standardizes the creation, distribution, revision, and archiving of documents across departments. It ensures version accuracy, approval transparency, and easy tracking, helping organizations maintain compliance and operational efficiency.
          </p>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-6 sm:py-8">
          <div className="w-full max-w-[508px] flex flex-col gap-[20px] sm:gap-[30px] items-center">
            {/* Form Card */}
            <div className="bg-white rounded-[20px] sm:rounded-[25px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] border border-[#ff3fb1] p-6 sm:p-[34px] w-full overflow-hidden">
              <div className="flex flex-col gap-[30px] sm:gap-[40px] w-full">
                {/* Logo */}
                <div className="flex gap-[10px] items-center">
                  <div className="w-[43px] h-[31px] relative overflow-hidden">
                    <img
                      src="/gacoan-logo.png"
                      alt="Gacoan Logo"
                      className="absolute h-[193%] left-[-20%] top-[-40%] w-[139%] max-w-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-[13px] text-[#243644]">DCMS</p>
                    <p className="text-[10px] font-medium text-[#738193]">Mie Gacoan</p>
                  </div>
                </div>

                {/* Welcome */}
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[16px] font-medium text-[#243644] leading-[24px]">
                    Welcome to <span className="font-semibold text-[#00B3D8]">DCMS</span>
                  </p>
                  <h2 className="text-[24px] font-medium text-[#243644] leading-[24px]">Sign in</h2>
                </div>

                {/* Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-[15px] w-full">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col gap-[15px] w-full">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Email"
                                className="h-[40px] border-0 border-b border-[#00b3d8] rounded-none px-3 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
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
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Password"
                                  className="h-[40px] border-0 border-b border-[#00b3d8] rounded-none px-3 pr-10 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00b3d8] hover:text-[#00a0c0] transition-colors"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-[5px] space-y-0">
                            <FormControl>
                              <Checkbox
                                className="h-6 w-6 border-[#00b3d8] data-[state=checked]:bg-[#4DB1D4] data-[state=checked]:border-[#4DB1D4]"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-[12px] font-medium text-[#243644] leading-[24px] cursor-pointer">
                              Remember me
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <a href="/forgot-password" className="text-[12px] font-medium text-[#00B3D8] leading-[24px] hover:underline">
                        Forgot password?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-[42px] sm:h-[44px] bg-[#4DB1D4] hover:bg-[#3da0c3] text-white font-semibold text-[14px] rounded-[8px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] mt-[15px]"
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
            </div>

            {/* Login as section - Mobile */}
            {accounts.length > 0 && (
              <div className="w-full">
                <p className="text-[14px] sm:text-[16px] text-[#243644] mb-4">
                  Login as
                </p>
                <div className="flex gap-4 sm:gap-[31px] flex-wrap justify-center sm:justify-start">
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

            {/* Footer */}
            <div className="flex flex-col gap-1 items-center text-center text-[11px] sm:text-[12px] text-[#6a7282] leading-[20px]">
              <p>© 2024 Mie Gacoan. All rights reserved.</p>
              <p>Version 2.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}