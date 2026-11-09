-- AlterTable
ALTER TABLE "VehicleInventory" ADD COLUMN     "detailsAreAssumed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inspectionReport" TEXT,
ADD COLUMN     "previousOwners" INTEGER;

-- AlterTable
ALTER TABLE "CityPrice" ADD COLUMN     "accessoriesInr" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "exShowroomPriceInr" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isAssumed" BOOLEAN NOT NULL DEFAULT true;

-- Existing price rows did not have these inputs and must remain unavailable until reviewed.
ALTER TABLE "CityPrice" ALTER COLUMN "accessoriesInr" DROP DEFAULT,
ALTER COLUMN "exShowroomPriceInr" DROP DEFAULT,
ALTER COLUMN "isAssumed" SET DEFAULT false;

-- CreateTable
CREATE TABLE "VehicleImage" (
    "id" TEXT NOT NULL,
    "vehicleStockId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isAssumed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VehicleImage_vehicleStockId_sortOrder_idx" ON "VehicleImage"("vehicleStockId", "sortOrder");

-- AddForeignKey
ALTER TABLE "VehicleImage" ADD CONSTRAINT "VehicleImage_vehicleStockId_fkey" FOREIGN KEY ("vehicleStockId") REFERENCES "VehicleInventory"("stockId") ON DELETE CASCADE ON UPDATE CASCADE;
