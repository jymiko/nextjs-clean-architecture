-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "invitation_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tokens_token_key" ON "invitation_tokens"("token");

-- CreateIndex
CREATE INDEX "invitation_tokens_userId_idx" ON "invitation_tokens"("userId");

-- CreateIndex
CREATE INDEX "invitation_tokens_token_idx" ON "invitation_tokens"("token");

-- CreateIndex
CREATE INDEX "invitation_tokens_expiresAt_idx" ON "invitation_tokens"("expiresAt");

-- AddForeignKey
ALTER TABLE "invitation_tokens" ADD CONSTRAINT "invitation_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
