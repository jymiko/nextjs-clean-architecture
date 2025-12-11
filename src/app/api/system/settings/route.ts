import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';

const rateLimiter = createRateLimitMiddleware();

export const GET = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // TODO: Implement SystemSettingsService to handle settings
    // const settingsService = container.cradle.systemSettingsService;

    // Mock response for now
    if (key) {
      const settings = {
        'app.name': 'NextJS Clean Architecture',
        'app.version': '1.0.0',
        'app.maintenance': false,
        'email.enabled': true,
        'backup.daily': true,
        'security.two_factor': false,
        'storage.max_file_size': '10MB'
      };

      const value = (settings as Record<string, any>)[key];
      if (value === undefined) {
        return NextResponse.json(
          { error: 'Setting not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ key, value });
    }

    const allSettings = {
      'app.name': 'NextJS Clean Architecture',
      'app.version': '1.0.0',
      'app.maintenance': false,
      'email.enabled': true,
      'email.smtp_host': 'smtp.example.com',
      'email.smtp_port': 587,
      'backup.daily': true,
      'backup.retention_days': 30,
      'security.two_factor': false,
      'security.session_timeout': 3600,
      'storage.max_file_size': '10MB',
      'storage.allowed_types': ['jpg', 'png', 'pdf', 'doc', 'docx'],
      'api.rate_limit': 100,
      'api.cors_enabled': true
    };

    return NextResponse.json(allSettings);
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });

export const PUT = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Key parameter is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { value } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      );
    }

    // TODO: Implement SystemSettingsService to update setting
    // const settingsService = container.cradle.systemSettingsService;
    // await settingsService.updateSetting(key, value);

    return NextResponse.json({
      success: true,
      message: 'Setting updated successfully',
      key,
      value
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });