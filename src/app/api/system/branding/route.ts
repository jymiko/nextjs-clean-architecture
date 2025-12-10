import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';

const rateLimiter = createRateLimitMiddleware();

// Mock branding data
let brandingData = {
  systemName: 'Gacoan DCMS',
  systemDescription: 'A Document Control Management System built with Next.js',
  logo: null,
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  favicon: null
};

export const GET = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // TODO: Implement SystemBrandingService to get from database
    // const brandingService = container.cradle.systemBrandingService;
    // const data = await brandingService.getBranding();

    return NextResponse.json(brandingData);
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });

export const PUT = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { systemName, systemDescription, logo, primaryColor, secondaryColor, favicon } = body;

    // TODO: Implement SystemBrandingService to update in database
    // const brandingService = container.cradle.systemBrandingService;
    // await brandingService.updateBranding({
    //   systemName,
    //   systemDescription,
    //   logo,
    //   primaryColor,
    //   secondaryColor,
    //   favicon
    // });

    // Update mock data
    if (systemName !== undefined) brandingData.systemName = systemName;
    if (systemDescription !== undefined) brandingData.systemDescription = systemDescription;
    if (logo !== undefined) brandingData.logo = logo;
    if (primaryColor !== undefined) brandingData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) brandingData.secondaryColor = secondaryColor;
    if (favicon !== undefined) brandingData.favicon = favicon;

    return NextResponse.json({
      success: true,
      message: 'Branding updated successfully',
      data: brandingData
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });

export const POST = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { logo, favicon } = body;

    // TODO: Implement file upload service for logo and favicon
    // const fileService = container.cradle.fileService;

    if (logo) {
      // Process logo upload
      // const logoUrl = await fileService.uploadLogo(logo);
      // brandingData.logo = logoUrl;
    }

    if (favicon) {
      // Process favicon upload
      // const faviconUrl = await fileService.uploadFavicon(favicon);
      // brandingData.favicon = faviconUrl;
    }

    return NextResponse.json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        logo: brandingData.logo,
        favicon: brandingData.favicon
      }
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });