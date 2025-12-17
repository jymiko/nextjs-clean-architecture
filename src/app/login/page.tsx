'use client';

import { useState, useEffect, useCallback } from 'react';
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

// Default branding values
const DEFAULT_BRANDING = {
  systemName: 'DCMS',
  systemDescription: 'Document Control Management System (DCMS) is a centralized platform that standardizes the creation, distribution, revision, and archiving of documents across departments. It ensures version accuracy, approval transparency, and easy tracking, helping organizations maintain compliance and operational efficiency.',
  primaryColor: '#4DB1D4',
  secondaryColor: '#00B3D8',
  logoUrl: '/gacoan-logo.png',
};

interface BrandingSettings {
  systemName: string;
  systemDescription: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { accounts, removeAccount } = useLastAccounts();
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [brandingLoaded, setBrandingLoaded] = useState(false);

  // Fetch branding settings
  const fetchBranding = useCallback(async () => {
    try {
      const response = await fetch('/api/system/settings/branding');
      const result = await response.json();

      if (result.success && result.data) {
        setBranding({
          systemName: result.data.systemName || DEFAULT_BRANDING.systemName,
          systemDescription: result.data.systemDescription || DEFAULT_BRANDING.systemDescription,
          primaryColor: result.data.primaryColor || DEFAULT_BRANDING.primaryColor,
          secondaryColor: result.data.secondaryColor || DEFAULT_BRANDING.secondaryColor,
          logoUrl: result.data.logoUrl || DEFAULT_BRANDING.logoUrl,
        });
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
      // Keep default branding on error
    } finally {
      setBrandingLoaded(true);
    }
  }, []);

  // Fetch branding on mount
  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

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

      // Check if password change is required
      if (response.requirePasswordChange) {
        toast.info('Please change your password before continuing', {
          duration: 3000,
        });
        setTimeout(() => {
          router.push('/change-password?required=true');
        }, 1000);
        return;
      }

      // Show success toast
      toast.success(`Login berhasil! Selamat datang, ${response.user.name}`, {
        duration: 2000,
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      // Clear tokens/cookies on login failure
      tokenManager.clearTokens();
      clearAuthCookies();

      let errorMessage = 'Login gagal. Periksa kembali email dan password Anda.';

      // Handle specific error cases
      const errMessage = err instanceof Error ? err.message : '';
      if (errMessage) {
        if (errMessage.includes('Invalid credentials')) {
          errorMessage = 'Email atau password salah.';
        } else if (errMessage.includes('Validation Error')) {
          errorMessage = 'Format input tidak valid.';
        } else if (errMessage.includes('Too many requests')) {
          errorMessage = 'Terlalu banyak percobaan login. Coba lagi nanti.';
        } else {
          errorMessage = errMessage;
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
      <div
        className="absolute top-0 left-0 right-0 h-[40vh] sm:h-[45vh] lg:h-[50vh] transition-colors duration-300"
        style={{ backgroundColor: branding.primaryColor }}
      />

      {/* Desktop Layout (lg+) - Absolute positioning */}
      <div className="hidden lg:block relative min-h-screen">
        {/* Left Side Text - Fixed position */}
        <div className="absolute left-[86px] top-[80px] w-[513px]">
          <div className="flex flex-col gap-[10px] mb-[25px]">
            <h1 className="text-[24px] font-semibold text-white">
              Sign in to
            </h1>
            <h2 className="text-[20px] font-medium text-white">
              {branding.systemName}
            </h2>
          </div>
          <p className="text-[14px] text-white leading-normal text-justify">
            {branding.systemDescription}
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
                  {branding.logoUrl && (
                    <div className="w-[43px] h-[31px] relative overflow-hidden">
                      <Image
                        src={branding.logoUrl}
                        alt={`${branding.systemName} Logo`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="font-semibold text-[13px] text-[#243644]">{branding.systemName}</p>
                    <p className="text-[10px] font-medium text-[#738193]">Mie Gacoan</p>
                  </div>
                </div>

                {/* Welcome */}
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[16px] font-medium text-[#243644] leading-[24px]">
                    Welcome to <span className="font-semibold" style={{ color: branding.secondaryColor }}>{branding.systemName}</span>
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
                                className="h-[40px] border-0 border-b rounded-none px-3 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                style={{ borderBottomColor: branding.secondaryColor }}
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
                                  className="h-[40px] border-0 border-b rounded-none px-3 pr-10 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                  style={{ borderBottomColor: branding.secondaryColor }}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                  style={{ color: branding.secondaryColor }}
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
                                className="h-6 w-6 data-[state=checked]:text-white"
                                style={{
                                  borderColor: branding.secondaryColor,
                                  backgroundColor: field.value ? branding.primaryColor : 'transparent',
                                }}
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
                      <a
                        href="/forgot-password"
                        className="text-[12px] font-medium leading-[24px] hover:underline"
                        style={{ color: branding.secondaryColor }}
                      >
                        Forgot password?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-[44px] text-white font-semibold text-[14px] rounded-[8px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: branding.primaryColor }}
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
              {branding.systemName}
            </h2>
          </div>
          <p className="text-[13px] sm:text-[14px] text-white leading-normal text-justify hidden sm:block">
            {branding.systemDescription}
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
                  {branding.logoUrl && (
                    <div className="w-[43px] h-[31px] relative overflow-hidden">
                      <Image
                        src={branding.logoUrl}
                        alt={`${branding.systemName} Logo`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="font-semibold text-[13px] text-[#243644]">{branding.systemName}</p>
                    <p className="text-[10px] font-medium text-[#738193]">Mie Gacoan</p>
                  </div>
                </div>

                {/* Welcome */}
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[16px] font-medium text-[#243644] leading-[24px]">
                    Welcome to <span className="font-semibold" style={{ color: branding.secondaryColor }}>{branding.systemName}</span>
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
                                className="h-[40px] border-0 border-b rounded-none px-3 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                style={{ borderBottomColor: branding.secondaryColor }}
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
                                  className="h-[40px] border-0 border-b rounded-none px-3 pr-10 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                  style={{ borderBottomColor: branding.secondaryColor }}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                  style={{ color: branding.secondaryColor }}
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
                                className="h-6 w-6 data-[state=checked]:text-white"
                                style={{
                                  borderColor: branding.secondaryColor,
                                  backgroundColor: field.value ? branding.primaryColor : 'transparent',
                                }}
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
                      <a
                        href="/forgot-password"
                        className="text-[12px] font-medium leading-[24px] hover:underline"
                        style={{ color: branding.secondaryColor }}
                      >
                        Forgot password?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-[42px] sm:h-[44px] text-white font-semibold text-[14px] rounded-[8px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] mt-[15px] hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: branding.primaryColor }}
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