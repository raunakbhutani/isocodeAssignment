-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'CONSULTANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('NEW', 'USED');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'SOLD');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('EX_SHOWROOM', 'LISTING_PRICE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'TEST_DRIVE_SCHEDULED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'CAR_PORTAL', 'SOCIAL_AD', 'WALK_IN', 'TEST_DRIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadActivityType" AS ENUM ('NOTE', 'STATUS_CHANGE', 'ASSIGNMENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TestDriveBookingStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('CONTACT', 'MARKETING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BUYER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionToken")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarVariant" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fuel" "FuelType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleInventory" (
    "stockId" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "variantId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "kilometres" INTEGER NOT NULL,
    "priceInr" INTEGER,
    "priceType" "PriceType" NOT NULL,
    "status" "VehicleStatus" NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "showroomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleInventory_pkey" PRIMARY KEY ("stockId")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityPrice" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "roadTaxBasisPoints" INTEGER NOT NULL,
    "registrationFeeInr" INTEGER NOT NULL,
    "insuranceInr" INTEGER NOT NULL,
    "otherChargesInr" INTEGER NOT NULL DEFAULT 0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CityPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Showroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "cityId" TEXT NOT NULL,
    "isAssumed" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Showroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showroomId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "buyerUserId" TEXT,
    "customerName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "source" "LeadSource" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "variantId" TEXT,
    "vehicleStockId" TEXT,
    "cityId" TEXT,
    "requestedShowroomId" TEXT,
    "assignedConsultantId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" TIMESTAMP(3),
    "firstRespondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadAssignment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "consultantId" TEXT NOT NULL,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestDriveSlot" (
    "id" TEXT NOT NULL,
    "showroomId" TEXT NOT NULL,
    "demoVehicleStockId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestDriveSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestDriveBooking" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "buyerUserId" TEXT,
    "status" "TestDriveBookingStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestDriveBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "leadId" TEXT,
    "type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "source" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "type" "LeadActivityType" NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadAiDraft" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "replyDraft" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadAiDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_brand_name_key" ON "CarModel"("brand", "name");

-- CreateIndex
CREATE INDEX "CarVariant_modelId_fuel_idx" ON "CarVariant"("modelId", "fuel");

-- CreateIndex
CREATE UNIQUE INDEX "CarVariant_modelId_name_key" ON "CarVariant"("modelId", "name");

-- CreateIndex
CREATE INDEX "VehicleInventory_type_status_idx" ON "VehicleInventory"("type", "status");

-- CreateIndex
CREATE INDEX "VehicleInventory_variantId_status_idx" ON "VehicleInventory"("variantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_state_country_key" ON "City"("name", "state", "country");

-- CreateIndex
CREATE INDEX "CityPrice_cityId_variantId_effectiveUntil_idx" ON "CityPrice"("cityId", "variantId", "effectiveUntil");

-- CreateIndex
CREATE UNIQUE INDEX "CityPrice_cityId_variantId_effectiveFrom_key" ON "CityPrice"("cityId", "variantId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "Showroom_cityId_isActive_idx" ON "Showroom"("cityId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Showroom_name_cityId_key" ON "Showroom"("name", "cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Consultant_userId_key" ON "Consultant"("userId");

-- CreateIndex
CREATE INDEX "Consultant_showroomId_isActive_idx" ON "Consultant"("showroomId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_reference_key" ON "Lead"("reference");

-- CreateIndex
CREATE INDEX "Lead_assignedConsultantId_status_receivedAt_idx" ON "Lead"("assignedConsultantId", "status", "receivedAt");

-- CreateIndex
CREATE INDEX "Lead_status_receivedAt_idx" ON "Lead"("status", "receivedAt");

-- CreateIndex
CREATE INDEX "Lead_source_receivedAt_idx" ON "Lead"("source", "receivedAt");

-- CreateIndex
CREATE INDEX "LeadAssignment_leadId_assignedAt_idx" ON "LeadAssignment"("leadId", "assignedAt");

-- CreateIndex
CREATE INDEX "LeadAssignment_consultantId_assignedAt_idx" ON "LeadAssignment"("consultantId", "assignedAt");

-- CreateIndex
CREATE INDEX "TestDriveSlot_showroomId_startsAt_isOpen_idx" ON "TestDriveSlot"("showroomId", "startsAt", "isOpen");

-- CreateIndex
CREATE UNIQUE INDEX "TestDriveSlot_demoVehicleStockId_startsAt_key" ON "TestDriveSlot"("demoVehicleStockId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "TestDriveBooking_slotId_key" ON "TestDriveBooking"("slotId");

-- CreateIndex
CREATE INDEX "TestDriveBooking_leadId_status_idx" ON "TestDriveBooking"("leadId", "status");

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_type_recordedAt_idx" ON "ConsentRecord"("userId", "type", "recordedAt");

-- CreateIndex
CREATE INDEX "ConsentRecord_leadId_type_recordedAt_idx" ON "ConsentRecord"("leadId", "type", "recordedAt");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadAiDraft_leadId_createdAt_idx" ON "LeadAiDraft"("leadId", "createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarVariant" ADD CONSTRAINT "CarVariant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInventory" ADD CONSTRAINT "VehicleInventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "CarVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInventory" ADD CONSTRAINT "VehicleInventory_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityPrice" ADD CONSTRAINT "CityPrice_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityPrice" ADD CONSTRAINT "CityPrice_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "CarVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showroom" ADD CONSTRAINT "Showroom_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultant" ADD CONSTRAINT "Consultant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultant" ADD CONSTRAINT "Consultant_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedConsultantId_fkey" FOREIGN KEY ("assignedConsultantId") REFERENCES "Consultant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "CarVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_vehicleStockId_fkey" FOREIGN KEY ("vehicleStockId") REFERENCES "VehicleInventory"("stockId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_requestedShowroomId_fkey" FOREIGN KEY ("requestedShowroomId") REFERENCES "Showroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAssignment" ADD CONSTRAINT "LeadAssignment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAssignment" ADD CONSTRAINT "LeadAssignment_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "Consultant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAssignment" ADD CONSTRAINT "LeadAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDriveSlot" ADD CONSTRAINT "TestDriveSlot_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDriveSlot" ADD CONSTRAINT "TestDriveSlot_demoVehicleStockId_fkey" FOREIGN KEY ("demoVehicleStockId") REFERENCES "VehicleInventory"("stockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDriveBooking" ADD CONSTRAINT "TestDriveBooking_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDriveBooking" ADD CONSTRAINT "TestDriveBooking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TestDriveSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDriveBooking" ADD CONSTRAINT "TestDriveBooking_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAiDraft" ADD CONSTRAINT "LeadAiDraft_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
