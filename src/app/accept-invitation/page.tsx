'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Image from 'next/image';
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
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const setPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SetPasswordForm = z.infer<typeof setPasswordSchema>;

// Default branding values
const DEFAULT_BRANDING = {
  systemName: 'DCMS',
  systemDescription: 'Document Control Management System (DCMS) is a centralized platform that standardizes the creation, distribution, revision, and archiving of documents across departments.',
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

interface InvitationInfo {
  valid: boolean;
  email?: string;
  name?: string;
  expiresAt?: string;
  message?: string;
}

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);

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
    }
  }, []);

  // Verify token on mount
  const verifyToken = useCallback(async () => {
    if (!token) {
      setIsVerifying(false);
      setError('No invitation token provided');
      return;
    }

    try {
      const response = await fetch(`/api/auth/verify-invitation?token=${token}`);
      const result = await response.json();

      // Handle API error responses (including validation errors)
      if (!response.ok || result.error) {
        setError(result.error || result.message || 'Invalid or expired invitation link');
        return;
      }

      if (result.valid) {
        setInvitationInfo(result);
      } else {
        setError(result.message || 'Invalid or expired invitation link');
      }
    } catch (err) {
      console.error('Failed to verify token:', err);
      setError('Failed to verify invitation link');
    } finally {
      setIsVerifying(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBranding();
    verifyToken();
  }, [fetchBranding, verifyToken]);

  const form = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SetPasswordForm) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast.success('Password set successfully! Redirecting to login...');

        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(result.error || 'Failed to set password');
        toast.error(result.error || 'Failed to set password');
      }
    } catch (err) {
      console.error('Failed to accept invitation:', err);
      setError('Failed to set password. Please try again.');
      toast.error('Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token or error state
  if (!isVerifying && (error || !invitationInfo?.valid)) {
    return (
      <div className="min-h-screen w-full bg-white relative overflow-x-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[40vh] sm:h-[45vh] lg:h-[50vh] transition-colors duration-300"
          style={{ backgroundColor: branding.primaryColor }}
        />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-8">
          <div className="bg-white rounded-[25px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] border border-red-200 p-8 max-w-md w-full">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Invalid Invitation
                </h2>
                <p className="text-gray-600 text-sm">
                  {error || 'This invitation link is invalid or has expired.'}
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full h-11 text-white font-medium"
                style={{ backgroundColor: branding.primaryColor }}
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen w-full bg-white relative overflow-x-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[40vh] sm:h-[45vh] lg:h-[50vh] transition-colors duration-300"
          style={{ backgroundColor: branding.primaryColor }}
        />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-8">
          <div className="bg-white rounded-[25px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] border border-green-200 p-8 max-w-md w-full">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Password Set Successfully!
                </h2>
                <p className="text-gray-600 text-sm">
                  Your account is now active. Redirecting to login...
                </p>
              </div>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: branding.primaryColor }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen w-full bg-white relative overflow-x-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[40vh] sm:h-[45vh] lg:h-[50vh] transition-colors duration-300"
          style={{ backgroundColor: branding.primaryColor }}
        />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-8">
          <div className="bg-white rounded-[25px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] p-8 max-w-md w-full">
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: branding.primaryColor }} />
              <p className="text-gray-600">Verifying invitation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen w-full bg-white relative overflow-x-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[40vh] sm:h-[45vh] lg:h-[50vh] transition-colors duration-300"
        style={{ backgroundColor: branding.primaryColor }}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:block relative min-h-screen">
        <div className="absolute left-[86px] top-[80px] w-[513px]">
          <div className="flex flex-col gap-[10px] mb-[25px]">
            <h1 className="text-[24px] font-semibold text-white">
              Set Your Password
            </h1>
            <h2 className="text-[20px] font-medium text-white">
              {branding.systemName}
            </h2>
          </div>
          <p className="text-[14px] text-white leading-normal text-justify">
            You have been invited to join {branding.systemName}. Please set your password to activate your account.
          </p>
        </div>

        <div className="absolute right-[116px] top-1/2 -translate-y-1/2 w-[508px]">
          <div className="flex flex-col gap-[30px] items-center">
            <div className="bg-white rounded-[25px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] border border-[#e5e7eb] p-[34px] w-full overflow-hidden">
              <div className="flex flex-col gap-[30px] w-full">
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

                {/* User Info */}
                {invitationInfo && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Welcome, {invitationInfo.name}!</span>
                      <br />
                      <span className="text-xs text-blue-600">{invitationInfo.email}</span>
                    </p>
                  </div>
                )}

                {/* Title */}
                <div className="flex flex-col gap-[10px]">
                  <h2 className="text-[24px] font-medium text-[#243644] leading-[24px]">
                    Create Your Password
                  </h2>
                  <p className="text-sm text-gray-600">
                    Set a strong password to secure your account
                  </p>
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
                        name="password"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Enter your password"
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
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder="Confirm your password"
                                  className="h-[40px] border-0 border-b rounded-none px-3 pr-10 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                  style={{ borderBottomColor: branding.secondaryColor }}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                  style={{ color: branding.secondaryColor }}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Password Requirements */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Password requirements:</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li className="flex items-center gap-2">
                          <span className={form.watch('password')?.length >= 6 ? 'text-green-600' : ''}>
                            {form.watch('password')?.length >= 6 ? '✓' : '○'}
                          </span>
                          At least 6 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[A-Z]/.test(form.watch('password') || '') ? 'text-green-600' : ''}>
                            {/[A-Z]/.test(form.watch('password') || '') ? '✓' : '○'}
                          </span>
                          One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[a-z]/.test(form.watch('password') || '') ? 'text-green-600' : ''}>
                            {/[a-z]/.test(form.watch('password') || '') ? '✓' : '○'}
                          </span>
                          One lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[0-9]/.test(form.watch('password') || '') ? 'text-green-600' : ''}>
                            {/[0-9]/.test(form.watch('password') || '') ? '✓' : '○'}
                          </span>
                          One number
                        </li>
                      </ul>
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
                          Setting Password...
                        </>
                      ) : (
                        'Set Password & Activate Account'
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

            <div className="flex flex-col gap-[4px] items-center text-center text-[12px] text-[#6a7282] leading-[20px]">
              <p>© 2024 Mie Gacoan. All rights reserved.</p>
              <p>Version 2.1.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden relative z-10 min-h-screen flex flex-col">
        <div className="px-6 sm:px-8 pt-8 sm:pt-12 max-w-[513px]">
          <div className="flex flex-col gap-[10px] mb-[20px]">
            <h1 className="text-[20px] sm:text-[24px] font-semibold text-white">
              Set Your Password
            </h1>
            <h2 className="text-[16px] sm:text-[20px] font-medium text-white">
              {branding.systemName}
            </h2>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-6 sm:py-8">
          <div className="w-full max-w-[508px] flex flex-col gap-[20px] sm:gap-[30px] items-center">
            <div className="bg-white rounded-[20px] sm:rounded-[25px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] border border-[#e5e7eb] p-6 sm:p-[34px] w-full overflow-hidden">
              <div className="flex flex-col gap-[20px] sm:gap-[30px] w-full">
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

                {/* User Info */}
                {invitationInfo && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Welcome, {invitationInfo.name}!</span>
                      <br />
                      <span className="text-xs text-blue-600">{invitationInfo.email}</span>
                    </p>
                  </div>
                )}

                {/* Title */}
                <div className="flex flex-col gap-[10px]">
                  <h2 className="text-[20px] sm:text-[24px] font-medium text-[#243644]">
                    Create Your Password
                  </h2>
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
                        name="password"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Enter your password"
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
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder="Confirm your password"
                                  className="h-[40px] border-0 border-b rounded-none px-3 pr-10 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                  style={{ borderBottomColor: branding.secondaryColor }}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                  style={{ color: branding.secondaryColor }}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Password Requirements */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Password requirements:</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li className="flex items-center gap-2">
                          <span className={form.watch('password')?.length >= 6 ? 'text-green-600' : ''}>
                            {form.watch('password')?.length >= 6 ? '✓' : '○'}
                          </span>
                          At least 6 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[A-Z]/.test(form.watch('password') || '') ? 'text-green-600' : ''}>
                            {/[A-Z]/.test(form.watch('password') || '') ? '✓' : '○'}
                          </span>
                          One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[a-z]/.test(form.watch('password') || '') ? 'text-green-600' : ''}>
                            {/[a-z]/.test(form.watch('password') || '') ? '✓' : '○'}
                          </span>
                          One lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[0-9]/.test(form.watch('password') || '') ? 'text-green-600' : ''}>
                            {/[0-9]/.test(form.watch('password') || '') ? '✓' : '○'}
                          </span>
                          One number
                        </li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-[42px] sm:h-[44px] text-white font-semibold text-[14px] rounded-[8px] shadow-[0px_2px_4px_0px_rgba(16,24,40,0.04)] hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: branding.primaryColor }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Setting Password...
                        </>
                      ) : (
                        'Set Password & Activate'
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

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

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4DB1D4]" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
