-- AlterEnum
ALTER TYPE "ApprovalStatus" ADD VALUE 'SIGNED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentStatus" ADD VALUE 'ON_APPROVAL';
ALTER TYPE "DocumentStatus" ADD VALUE 'ON_REVISION';
ALTER TYPE "DocumentStatus" ADD VALUE 'WAITING_VALIDATION';

-- AlterTable
ALTER TABLE "document_approvals" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "revisionCycle" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "revisionCycle" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "document_revision_requests" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "approvalLevel" INTEGER NOT NULL,
    "approvalId" TEXT,
    "signatureSnapshot" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_revision_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_revision_requests_documentId_idx" ON "document_revision_requests"("documentId");

-- CreateIndex
CREATE INDEX "document_revision_requests_requestedById_idx" ON "document_revision_requests"("requestedById");

-- CreateIndex
CREATE INDEX "document_revision_requests_createdAt_idx" ON "document_revision_requests"("createdAt");

-- CreateIndex
CREATE INDEX "document_approvals_revisionCycle_idx" ON "document_approvals"("revisionCycle");

-- AddForeignKey
ALTER TABLE "document_revision_requests" ADD CONSTRAINT "document_revision_requests_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_revision_requests" ADD CONSTRAINT "document_revision_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
