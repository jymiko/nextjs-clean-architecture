-- CreateEnum
CREATE TYPE "ValidatedCategory" AS ENUM ('MANAGEMENT', 'DISTRIBUTED');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "companyStamp" TEXT,
ADD COLUMN     "finalPdfUrl" TEXT,
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedById" TEXT,
ADD COLUMN     "validatedCategory" "ValidatedCategory";

-- CreateIndex
CREATE INDEX "documents_validatedById_idx" ON "documents"("validatedById");

-- CreateIndex
CREATE INDEX "documents_validatedCategory_idx" ON "documents"("validatedCategory");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
