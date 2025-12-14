-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "divisionId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "divisions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "headOfDivisionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "divisions_code_key" ON "divisions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_name_key" ON "divisions"("name");

-- CreateIndex
CREATE INDEX "divisions_headOfDivisionId_idx" ON "divisions"("headOfDivisionId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_tokenHash_idx" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_userId_deviceId_key" ON "refresh_tokens"("userId", "deviceId");

-- CreateIndex
CREATE INDEX "departments_divisionId_idx" ON "departments"("divisionId");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
