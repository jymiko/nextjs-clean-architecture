'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Image from 'next/image';
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
import { Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

// Default branding values
const DEFAULT_BRANDING = {
  systemName: 'DCMS',
  systemDescription: 'Document Control Management System',
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

function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRequired = searchParams.get('required') === 'true';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.put('/api/auth/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setIsSuccess(true);
      toast.success('Password changed successfully!');

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Failed to change password:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
                  Password Changed!
                </h2>
                <p className="text-gray-600 text-sm">
                  Your password has been updated. Redirecting to dashboard...
                </p>
              </div>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: branding.primaryColor }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              {isRequired ? 'Password Change Required' : 'Change Password'}
            </h1>
            <h2 className="text-[20px] font-medium text-white">
              {branding.systemName}
            </h2>
          </div>
          <p className="text-[14px] text-white leading-normal text-justify">
            {isRequired
              ? 'For security reasons, you must change your temporary password before accessing the system.'
              : 'Keep your account secure by regularly updating your password.'
            }
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

                {/* Required Warning */}
                {isRequired && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Security Notice</p>
                      <p>You are using a temporary password. Please create a new secure password to continue.</p>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="flex flex-col gap-[10px]">
                  <h2 className="text-[24px] font-medium text-[#243644] leading-[24px]">
                    {isRequired ? 'Create New Password' : 'Update Password'}
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
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              {isRequired ? 'Temporary Password' : 'Current Password'}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showCurrentPassword ? 'text' : 'password'}
                                  placeholder={isRequired ? 'Enter your temporary password' : 'Enter current password'}
                                  className="h-[40px] border-0 border-b rounded-none px-3 pr-10 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                  style={{ borderBottomColor: branding.secondaryColor }}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                  style={{ color: branding.secondaryColor }}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showNewPassword ? 'text' : 'password'}
                                  placeholder="Enter your new password"
                                  className="h-[40px] border-0 border-b rounded-none px-3 pr-10 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                  style={{ borderBottomColor: branding.secondaryColor }}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                  style={{ color: branding.secondaryColor }}
                                >
                                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                              Confirm New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder="Confirm your new password"
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
                          <span className={form.watch('newPassword')?.length >= 6 ? 'text-green-600' : ''}>
                            {form.watch('newPassword')?.length >= 6 ? '✓' : '○'}
                          </span>
                          At least 6 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[A-Z]/.test(form.watch('newPassword') || '') ? 'text-green-600' : ''}>
                            {/[A-Z]/.test(form.watch('newPassword') || '') ? '✓' : '○'}
                          </span>
                          One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[a-z]/.test(form.watch('newPassword') || '') ? 'text-green-600' : ''}>
                            {/[a-z]/.test(form.watch('newPassword') || '') ? '✓' : '○'}
                          </span>
                          One lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[0-9]/.test(form.watch('newPassword') || '') ? 'text-green-600' : ''}>
                            {/[0-9]/.test(form.watch('newPassword') || '') ? '✓' : '○'}
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
                          Changing Password...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>

                    {!isRequired && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-[44px] text-[14px] rounded-[8px]"
                        onClick={() => router.back()}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    )}
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
              {isRequired ? 'Password Change Required' : 'Change Password'}
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

                {/* Required Warning */}
                {isRequired && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Security Notice</p>
                      <p className="text-xs">You must change your temporary password to continue.</p>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="flex flex-col gap-[10px]">
                  <h2 className="text-[20px] sm:text-[24px] font-medium text-[#243644]">
                    {isRequired ? 'Create New Password' : 'Update Password'}
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
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              {isRequired ? 'Temporary Password' : 'Current Password'}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showCurrentPassword ? 'text' : 'password'}
                                  placeholder={isRequired ? 'Enter temporary password' : 'Enter current password'}
                                  className="h-[40px] border-0 border-b rounded-none px-3 pr-10 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                  style={{ borderBottomColor: branding.secondaryColor }}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                  style={{ color: branding.secondaryColor }}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-[8px]">
                            <FormLabel className="text-[12px] text-[#334155] leading-none font-normal">
                              New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showNewPassword ? 'text' : 'password'}
                                  placeholder="Enter new password"
                                  className="h-[40px] border-0 border-b rounded-none px-3 pr-10 text-[14px] placeholder:text-[rgba(189,206,223,0.53)] focus-visible:ring-0 transition-colors"
                                  style={{ borderBottomColor: branding.secondaryColor }}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                  style={{ color: branding.secondaryColor }}
                                >
                                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                              Confirm New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder="Confirm new password"
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
                          <span className={form.watch('newPassword')?.length >= 6 ? 'text-green-600' : ''}>
                            {form.watch('newPassword')?.length >= 6 ? '✓' : '○'}
                          </span>
                          At least 6 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[A-Z]/.test(form.watch('newPassword') || '') ? 'text-green-600' : ''}>
                            {/[A-Z]/.test(form.watch('newPassword') || '') ? '✓' : '○'}
                          </span>
                          One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[a-z]/.test(form.watch('newPassword') || '') ? 'text-green-600' : ''}>
                            {/[a-z]/.test(form.watch('newPassword') || '') ? '✓' : '○'}
                          </span>
                          One lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[0-9]/.test(form.watch('newPassword') || '') ? 'text-green-600' : ''}>
                            {/[0-9]/.test(form.watch('newPassword') || '') ? '✓' : '○'}
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
                          Changing Password...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>

                    {!isRequired && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-[42px] sm:h-[44px] text-[14px] rounded-[8px]"
                        onClick={() => router.back()}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    )}
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

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4DB1D4]" />
      </div>
    }>
      <ChangePasswordContent />
    </Suspense>
  );
}
