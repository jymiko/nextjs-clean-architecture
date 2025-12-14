import {
  SystemSetting,
  CreateSystemSettingDTO,
  UpdateSystemSettingDTO,
  BrandingSettings,
  UpdateBrandingDTO,
  DEFAULT_BRANDING,
  BRANDING_KEYS,
} from '@/domain/entities/SystemSetting';
import { ISystemSettingRepository } from '@/domain/repositories/ISystemSettingRepository';
import { prisma } from '../database';
import { NotFoundError } from '../errors';

export class PrismaSystemSettingRepository implements ISystemSettingRepository {
  private mapToSystemSetting(data: {
    id: string;
    key: string;
    value: string;
    type: string;
    category: string;
    description: string | null;
    isPublic: boolean;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SystemSetting {
    return {
      id: data.id,
      key: data.key,
      value: data.value,
      type: data.type as 'string' | 'number' | 'boolean' | 'json',
      category: data.category,
      description: data.description,
      isPublic: data.isPublic,
      updatedBy: data.updatedBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async findByKey(key: string): Promise<SystemSetting | null> {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) return null;
    return this.mapToSystemSetting(setting);
  }

  async findByCategory(category: string): Promise<SystemSetting[]> {
    const settings = await prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });

    return settings.map((s) => this.mapToSystemSetting(s));
  }

  async findAll(): Promise<SystemSetting[]> {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    return settings.map((s) => this.mapToSystemSetting(s));
  }

  async findPublic(): Promise<SystemSetting[]> {
    const settings = await prisma.systemSetting.findMany({
      where: { isPublic: true },
      orderBy: { key: 'asc' },
    });

    return settings.map((s) => this.mapToSystemSetting(s));
  }

  async create(data: CreateSystemSettingDTO): Promise<SystemSetting> {
    const setting = await prisma.systemSetting.create({
      data: {
        key: data.key,
        value: data.value,
        type: data.type,
        category: data.category,
        description: data.description,
        isPublic: data.isPublic ?? false,
        updatedBy: data.updatedBy,
      },
    });

    return this.mapToSystemSetting(setting);
  }

  async update(key: string, data: UpdateSystemSettingDTO): Promise<SystemSetting | null> {
    const existing = await this.findByKey(key);
    if (!existing) {
      throw new NotFoundError(`Setting with key '${key}' not found`);
    }

    const setting = await prisma.systemSetting.update({
      where: { key },
      data: {
        value: data.value,
        type: data.type,
        description: data.description,
        isPublic: data.isPublic,
        updatedBy: data.updatedBy,
      },
    });

    return this.mapToSystemSetting(setting);
  }

  async upsert(key: string, data: CreateSystemSettingDTO): Promise<SystemSetting> {
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      create: {
        key: data.key,
        value: data.value,
        type: data.type,
        category: data.category,
        description: data.description,
        isPublic: data.isPublic ?? false,
        updatedBy: data.updatedBy,
      },
      update: {
        value: data.value,
        type: data.type,
        description: data.description,
        isPublic: data.isPublic,
        updatedBy: data.updatedBy,
      },
    });

    return this.mapToSystemSetting(setting);
  }

  async delete(key: string): Promise<boolean> {
    const existing = await this.findByKey(key);
    if (!existing) {
      throw new NotFoundError(`Setting with key '${key}' not found`);
    }

    await prisma.systemSetting.delete({
      where: { key },
    });

    return true;
  }

  // Branding-specific operations
  async getBranding(): Promise<BrandingSettings> {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: Object.values(BRANDING_KEYS),
        },
      },
    });

    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    return {
      systemName: settingsMap.get(BRANDING_KEYS.SYSTEM_NAME) ?? DEFAULT_BRANDING.systemName,
      systemDescription: settingsMap.get(BRANDING_KEYS.SYSTEM_DESCRIPTION) ?? DEFAULT_BRANDING.systemDescription,
      primaryColor: settingsMap.get(BRANDING_KEYS.PRIMARY_COLOR) ?? DEFAULT_BRANDING.primaryColor,
      secondaryColor: settingsMap.get(BRANDING_KEYS.SECONDARY_COLOR) ?? DEFAULT_BRANDING.secondaryColor,
      logoUrl: settingsMap.get(BRANDING_KEYS.LOGO_URL) ?? DEFAULT_BRANDING.logoUrl,
    };
  }

  async updateBranding(data: UpdateBrandingDTO): Promise<BrandingSettings> {
    const category = 'branding';
    const updates: Array<{ key: string; value: string; description: string }> = [];

    if (data.systemName !== undefined) {
      updates.push({
        key: BRANDING_KEYS.SYSTEM_NAME,
        value: data.systemName,
        description: 'System name displayed in header and title',
      });
    }

    if (data.systemDescription !== undefined) {
      updates.push({
        key: BRANDING_KEYS.SYSTEM_DESCRIPTION,
        value: data.systemDescription,
        description: 'System description for SEO and about page',
      });
    }

    if (data.primaryColor !== undefined) {
      updates.push({
        key: BRANDING_KEYS.PRIMARY_COLOR,
        value: data.primaryColor,
        description: 'Primary brand color (hex)',
      });
    }

    if (data.secondaryColor !== undefined) {
      updates.push({
        key: BRANDING_KEYS.SECONDARY_COLOR,
        value: data.secondaryColor,
        description: 'Secondary brand color (hex)',
      });
    }

    if (data.logoUrl !== undefined) {
      updates.push({
        key: BRANDING_KEYS.LOGO_URL,
        value: data.logoUrl ?? '',
        description: 'System logo URL',
      });
    }

    // Perform upserts in a transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.systemSetting.upsert({
          where: { key: update.key },
          create: {
            key: update.key,
            value: update.value,
            type: 'string',
            category,
            description: update.description,
            isPublic: true,
            updatedBy: data.updatedBy,
          },
          update: {
            value: update.value,
            updatedBy: data.updatedBy,
          },
        })
      )
    );

    return this.getBranding();
  }
}
