import {
  SystemSetting,
  CreateSystemSettingDTO,
  UpdateSystemSettingDTO,
  BrandingSettings,
  UpdateBrandingDTO,
} from '../entities/SystemSetting';

export interface ISystemSettingRepository {
  // Generic setting operations
  findByKey(key: string): Promise<SystemSetting | null>;
  findByCategory(category: string): Promise<SystemSetting[]>;
  findAll(): Promise<SystemSetting[]>;
  findPublic(): Promise<SystemSetting[]>;
  create(data: CreateSystemSettingDTO): Promise<SystemSetting>;
  update(key: string, data: UpdateSystemSettingDTO): Promise<SystemSetting | null>;
  upsert(key: string, data: CreateSystemSettingDTO): Promise<SystemSetting>;
  delete(key: string): Promise<boolean>;

  // Branding-specific operations
  getBranding(): Promise<BrandingSettings>;
  updateBranding(data: UpdateBrandingDTO): Promise<BrandingSettings>;
}
