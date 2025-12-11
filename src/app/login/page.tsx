'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import { Loader2, Eye, EyeOff, User } from 'lucide-react';
import { useLastAccounts } from '@/hooks/use-last-accounts';
import { LastAccountCard } from '@/components/auth/last-account-card';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accounts, saveAccount, removeAccount } = useLastAccounts();

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      const tokens = tokenManager.getTokens();
      if (tokens) {
        try {
          await apiClient.get('/api/auth/me');
          router.push('/');
        } catch {
          tokenManager.clearTokens();
        }
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
    <div className="relative min-h-screen w-full bg-white">
      {/* Top Blue Section */}
      <div className="absolute top-0 left-0 w-full h-[416px] bg-[#4DB1D4]" />

      <div className="relative w-full h-screen">
        <div className="container mx-auto flex h-full">
          {/* Left Content */}
          <div className="flex-1 p-[86px] pt-[80px]">
            {/* Welcome Text */}
            <div className="mb-[25px] max-w-[513px]">
              <h1 className="mb-[10px] font-semibold text-[24px] text-white">
                Sign in to
              </h1>
              <h2 className="font-medium text-[20px] text-white w-[420px]">
                Document Control Management System
              </h2>
            </div>
            <p className="text-sm text-white/90 text-justify w-[513px]">
              Document Control Management System (DCMS) is a centralized platform that standardizes the creation, distribution, revision, and archiving of documents across departments. It ensures version accuracy, approval transparency, and easy tracking, helping organizations maintain compliance and operational efficiency.
            </p>

            {/* Additional Content */}
            <div className="mt-[155px]">
              <div className="max-w-[513px]">
                {/* Login as section */}
                {accounts.length > 0 && (
                  <div>
                    <p className="text-base font-['Poppins:Regular',sans-serif] text-[color:var(--font---black-2,#243644)] mb-4">
                      Login as
                    </p>
                    <div className="flex gap-4">
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
            </div>
          </div>

          {/* Right Content - Login Form */}
          <div className="w-[508px] flex items-center justify-center pr-[86px]">
            <div className="w-full">
              {/* Login Form Container */}
              <div className="bg-white border border-[#FF3FB1] rounded-[25px] p-[34px] shadow-sm">
                <div className="space-y-[40px]">
                  {/* Logo/Brand */}
                  <div className="flex items-center gap-[10px]">
                    <div className="w-[43px] h-[31px] bg-[#4DB1D4] rounded flex items-center justify-center">
                      <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[13px] text-[#243644]">DCMS</p>
                      <p className="text-[10px] text-[#738193]">Mie Gacoan</p>
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div>
                    <p className="font-medium text-[16px] text-[#243644] mb-[10px]">
                      Welcome to <span className="font-semibold text-[#00B3D8]">DCMS</span>
                    </p>
                    <h2 className="font-medium text-[24px] text-[#243644]">Sign in</h2>
                  </div>

  
                  {/* Login Form */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[15px]">
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
                            <FormLabel className="text-[12px] text-slate-700">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Email"
                                className="h-[40px] bg-[#F6FAFF] border-0 border-b-[1px] border-[#00B3D8] rounded-none px-0 focus-visible:ring-0"
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
                            <FormLabel className="text-[12px] text-slate-700">
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Password"
                                  className="h-[40px] bg-[#F6FAFF] border-0 border-b-[1px] border-[#00B3D8] rounded-none px-0 pr-10 focus-visible:ring-0"
                                  disabled={isLoading}
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={isLoading}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-[5px]">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-[#4DB1D4] border-gray-300 rounded focus:ring-[#4DB1D4]"
                          />
                          <span className="text-[12px] text-[#243644]">Remember me</span>
                        </label>
                        <a
                          href="/forgot-password"
                          className="text-[12px] text-[#00B3D8] hover:underline"
                        >
                          Forgot password?
                        </a>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-[44px] bg-[#4DB1D4] hover:bg-[#3da0c3] text-white font-semibold text-[14px] rounded-[8px] shadow-sm"
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
              <div className="text-center mt-[30px] text-[12px] text-[#6A7282] space-y-[4px]">
                <p>© 2024 Mie Gacoan. All rights reserved.</p>
                <p>Version 2.1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}