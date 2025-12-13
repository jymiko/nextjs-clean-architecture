-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "destinationDepartmentId" TEXT,
ADD COLUMN     "estimatedDistributionDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "documents_destinationDepartmentId_idx" ON "documents"("destinationDepartmentId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_destinationDepartmentId_fkey" FOREIGN KEY ("destinationDepartmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
