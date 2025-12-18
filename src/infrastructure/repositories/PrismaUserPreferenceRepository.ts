import {
  UserPreference,
  UpdateUserPreferenceDTO,
  FcmToken,
  RegisterFcmTokenDTO,
  NotificationFrequency,
} from '@/domain/entities/UserPreference';
import { IUserPreferenceRepository } from '@/domain/repositories/IUserPreferenceRepository';
import { prisma } from '../database';
import { NotificationFrequency as PrismaNotificationFrequency } from '@prisma/client';

export class PrismaUserPreferenceRepository implements IUserPreferenceRepository {
  private mapToUserPreference(data: {
    id: string;
    userId: string;
    language: string;
    timezone: string;
    dateFormat: string;
    notifyEmail: boolean;
    notifyInApp: boolean;
    notifyPush: boolean;
    notifyApproval: boolean;
    notifyDistribution: boolean;
    notifyExpiring: boolean;
    notifyObsolete: boolean;
    notifyWeeklyDigest: boolean;
    notificationFrequency: PrismaNotificationFrequency;
    theme: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserPreference {
    return {
      id: data.id,
      userId: data.userId,
      language: data.language,
      timezone: data.timezone,
      dateFormat: data.dateFormat,
      theme: data.theme,
      notifyEmail: data.notifyEmail,
      notifyInApp: data.notifyInApp,
      notifyPush: data.notifyPush,
      notifyApproval: data.notifyApproval,
      notifyDistribution: data.notifyDistribution,
      notifyExpiring: data.notifyExpiring,
      notifyObsolete: data.notifyObsolete,
      notifyWeeklyDigest: data.notifyWeeklyDigest,
      notificationFrequency: data.notificationFrequency as NotificationFrequency,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private mapToFcmToken(data: {
    id: string;
    preferenceId: string;
    token: string;
    deviceId: string | null;
    deviceName: string | null;
    platform: string | null;
    isActive: boolean;
    lastUsedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): FcmToken {
    return {
      id: data.id,
      preferenceId: data.preferenceId,
      token: data.token,
      deviceId: data.deviceId,
      deviceName: data.deviceName,
      platform: data.platform,
      isActive: data.isActive,
      lastUsedAt: data.lastUsedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async findByUserId(userId: string): Promise<UserPreference | null> {
    const preference = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preference) return null;
    return this.mapToUserPreference(preference);
  }

  async create(userId: string): Promise<UserPreference> {
    const preference = await prisma.userPreference.create({
      data: { userId },
    });

    return this.mapToUserPreference(preference);
  }

  async update(userId: string, data: UpdateUserPreferenceDTO): Promise<UserPreference | null> {
    // First check if the preference exists
    const existing = await this.findByUserId(userId);
    if (!existing) {
      return null;
    }

    const preference = await prisma.userPreference.update({
      where: { userId },
      data: {
        ...(data.language !== undefined && { language: data.language }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
        ...(data.dateFormat !== undefined && { dateFormat: data.dateFormat }),
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.notifyEmail !== undefined && { notifyEmail: data.notifyEmail }),
        ...(data.notifyInApp !== undefined && { notifyInApp: data.notifyInApp }),
        ...(data.notifyPush !== undefined && { notifyPush: data.notifyPush }),
        ...(data.notifyApproval !== undefined && { notifyApproval: data.notifyApproval }),
        ...(data.notifyDistribution !== undefined && { notifyDistribution: data.notifyDistribution }),
        ...(data.notifyExpiring !== undefined && { notifyExpiring: data.notifyExpiring }),
        ...(data.notifyObsolete !== undefined && { notifyObsolete: data.notifyObsolete }),
        ...(data.notifyWeeklyDigest !== undefined && { notifyWeeklyDigest: data.notifyWeeklyDigest }),
        ...(data.notificationFrequency !== undefined && {
          notificationFrequency: data.notificationFrequency as PrismaNotificationFrequency,
        }),
      },
    });

    return this.mapToUserPreference(preference);
  }

  async getOrCreate(userId: string): Promise<UserPreference> {
    let preference = await this.findByUserId(userId);
    if (!preference) {
      preference = await this.create(userId);
    }
    return preference;
  }

  // FCM Token management
  async addFcmToken(userId: string, data: RegisterFcmTokenDTO): Promise<FcmToken> {
    // Ensure user preference exists
    const preference = await this.getOrCreate(userId);

    // Upsert - update if token exists, create if not
    const fcmToken = await prisma.fcmToken.upsert({
      where: { token: data.token },
      update: {
        preferenceId: preference.id,
        deviceId: data.deviceId ?? null,
        deviceName: data.deviceName ?? null,
        platform: data.platform ?? null,
        isActive: true,
        lastUsedAt: new Date(),
      },
      create: {
        preferenceId: preference.id,
        token: data.token,
        deviceId: data.deviceId ?? null,
        deviceName: data.deviceName ?? null,
        platform: data.platform ?? null,
      },
    });

    return this.mapToFcmToken(fcmToken);
  }

  async removeFcmToken(token: string): Promise<boolean> {
    try {
      await prisma.fcmToken.delete({
        where: { token },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getFcmTokensByUserId(userId: string): Promise<FcmToken[]> {
    const preference = await this.findByUserId(userId);
    if (!preference) return [];

    const tokens = await prisma.fcmToken.findMany({
      where: {
        preferenceId: preference.id,
        isActive: true,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });

    return tokens.map((t) => this.mapToFcmToken(t));
  }

  async updateFcmTokenLastUsed(token: string): Promise<void> {
    try {
      await prisma.fcmToken.update({
        where: { token },
        data: { lastUsedAt: new Date() },
      });
    } catch {
      // Token might not exist, silently ignore
    }
  }

  async deactivateFcmToken(token: string): Promise<boolean> {
    try {
      await prisma.fcmToken.update({
        where: { token },
        data: { isActive: false },
      });
      return true;
    } catch {
      return false;
    }
  }
}
