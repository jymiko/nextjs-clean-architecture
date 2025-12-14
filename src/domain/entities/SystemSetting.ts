// System Setting Entity
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description: string | null;
  isPublic: boolean;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Branding settings structure
export interface BrandingSettings {
  systemName: string;
  systemDescription: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
}

// DTOs
export interface CreateSystemSettingDTO {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  isPublic?: boolean;
  updatedBy?: string;
}

export interface UpdateSystemSettingDTO {
  value?: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isPublic?: boolean;
  updatedBy?: string;
}

export interface UpdateBrandingDTO {
  systemName?: string;
  systemDescription?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string | null;
  updatedBy?: string;
}

// Default branding values
export const DEFAULT_BRANDING: BrandingSettings = {
  systemName: 'Document Control Management System',
  systemDescription: 'A comprehensive document control and management platform',
  primaryColor: '#2563eb',
  secondaryColor: '#8b5cf6',
  logoUrl: null,
};

// Branding setting keys
export const BRANDING_KEYS = {
  SYSTEM_NAME: 'branding.system_name',
  SYSTEM_DESCRIPTION: 'branding.system_description',
  PRIMARY_COLOR: 'branding.primary_color',
  SECONDARY_COLOR: 'branding.secondary_color',
  LOGO_URL: 'branding.logo_url',
} as const;
