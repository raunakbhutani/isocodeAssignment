-- CreateEnum
CREATE TYPE "LeadAiStatus" AS ENUM ('GENERATED', 'UNAVAILABLE', 'MANUAL');

-- AlterTable
ALTER TABLE "LeadAiDraft" ADD COLUMN     "status" "LeadAiStatus" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "statusMessage" TEXT,
ADD COLUMN     "summaryData" JSONB;
