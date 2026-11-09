-- CreateEnum
CREATE TYPE "LeadNotificationType" AS ENUM ('LEAD_ASSIGNED', 'LEAD_UNASSIGNED', 'LEAD_REASSIGNED');

-- Preserve existing lead intent while renaming the two retired statuses.
BEGIN;
CREATE TYPE "LeadStatus_new" AS ENUM ('NEW', 'CONTACTED', 'NEGOTIATION', 'TEST_DRIVE_SCHEDULED', 'CONVERTED', 'LOST');
ALTER TABLE "Lead" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Lead"
  ALTER COLUMN "status" TYPE "LeadStatus_new"
  USING (
    CASE "status"::text
      WHEN 'QUALIFIED' THEN 'NEGOTIATION'
      WHEN 'WON' THEN 'CONVERTED'
      ELSE "status"::text
    END
  )::"LeadStatus_new";
ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
ALTER TYPE "LeadStatus_new" RENAME TO "LeadStatus";
DROP TYPE "LeadStatus_old";
ALTER TABLE "Lead" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "budgetInr" INTEGER,
ADD COLUMN "purchaseTimeline" TEXT;

-- AlterTable
ALTER TABLE "LeadAssignment" ADD COLUMN "modelId" TEXT,
ADD COLUMN "showroomId" TEXT;

-- CreateTable
CREATE TABLE "LeadAssignmentCursor" (
  "showroomId" TEXT NOT NULL,
  "modelId" TEXT NOT NULL,
  "nextIndex" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeadAssignmentCursor_pkey" PRIMARY KEY ("showroomId", "modelId")
);

-- CreateTable
CREATE TABLE "LeadNotification" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "recipientConsultantId" TEXT,
  "type" "LeadNotificationType" NOT NULL,
  "message" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantModel" (
  "consultantId" TEXT NOT NULL,
  "modelId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConsultantModel_pkey" PRIMARY KEY ("consultantId", "modelId")
);

-- CreateIndex
CREATE INDEX "LeadNotification_recipientConsultantId_readAt_createdAt_idx"
  ON "LeadNotification"("recipientConsultantId", "readAt", "createdAt");
CREATE INDEX "LeadNotification_leadId_createdAt_idx"
  ON "LeadNotification"("leadId", "createdAt");
CREATE INDEX "ConsultantModel_modelId_consultantId_idx"
  ON "ConsultantModel"("modelId", "consultantId");

-- AddForeignKey
ALTER TABLE "LeadAssignmentCursor"
  ADD CONSTRAINT "LeadAssignmentCursor_showroomId_fkey"
  FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadAssignmentCursor"
  ADD CONSTRAINT "LeadAssignmentCursor_modelId_fkey"
  FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadNotification"
  ADD CONSTRAINT "LeadNotification_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadNotification"
  ADD CONSTRAINT "LeadNotification_recipientConsultantId_fkey"
  FOREIGN KEY ("recipientConsultantId") REFERENCES "Consultant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConsultantModel"
  ADD CONSTRAINT "ConsultantModel_consultantId_fkey"
  FOREIGN KEY ("consultantId") REFERENCES "Consultant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConsultantModel"
  ADD CONSTRAINT "ConsultantModel_modelId_fkey"
  FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadAssignment"
  ADD CONSTRAINT "LeadAssignment_showroomId_fkey"
  FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LeadAssignment"
  ADD CONSTRAINT "LeadAssignment_modelId_fkey"
  FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
