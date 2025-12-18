-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('IMMEDIATE', 'HOURLY', 'DAILY', 'WEEKLY');

-- AlterTable
ALTER TABLE "user_preferences" ADD COLUMN     "notificationFrequency" "NotificationFrequency" NOT NULL DEFAULT 'IMMEDIATE',
ADD COLUMN     "notifyPush" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyWeeklyDigest" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "fcm_tokens" (
    "id" TEXT NOT NULL,
    "preferenceId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceId" TEXT,
    "deviceName" TEXT,
    "platform" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fcm_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fcm_tokens_token_key" ON "fcm_tokens"("token");

-- CreateIndex
CREATE INDEX "fcm_tokens_preferenceId_idx" ON "fcm_tokens"("preferenceId");

-- CreateIndex
CREATE INDEX "fcm_tokens_token_idx" ON "fcm_tokens"("token");

-- AddForeignKey
ALTER TABLE "fcm_tokens" ADD CONSTRAINT "fcm_tokens_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "user_preferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
