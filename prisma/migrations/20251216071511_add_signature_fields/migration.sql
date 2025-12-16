-- AlterTable
ALTER TABLE "document_approvals" ADD COLUMN     "signatureImage" TEXT,
ADD COLUMN     "signedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "preparedBySignature" TEXT,
ADD COLUMN     "preparedBySignedAt" TIMESTAMP(3);
