-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "acknowledgerName" TEXT,
ADD COLUMN     "acknowledgerPosition" TEXT,
ADD COLUMN     "approverName" TEXT,
ADD COLUMN     "approverPosition" TEXT,
ADD COLUMN     "procedureContent" TEXT,
ADD COLUMN     "relatedDocumentsText" TEXT,
ADD COLUMN     "responsibleDocument" TEXT,
ADD COLUMN     "reviewerName" TEXT,
ADD COLUMN     "reviewerPosition" TEXT,
ADD COLUMN     "scope" TEXT,
ADD COLUMN     "termsAndAbbreviations" TEXT,
ADD COLUMN     "warning" TEXT;
