import { Suspense } from "react";
import TestDriveForm from "../../components/test-drive-form";
import { Container, Eyebrow } from "../../components/ui";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Test-drive request | DriveHub" };

async function BookingForm({ searchParams }) {
  await connection();
  const query = await searchParams;
  const vehicleStockId = typeof query?.vehicle === "string" ? query.vehicle : "";
  const slots = await prisma.testDriveSlot.findMany({
    where: {
      isOpen: true,
      startsAt: { gt: new Date() },
      showroom: { isActive: true },
      demoVehicle: { isDemo: true, status: "AVAILABLE" },
    },
    select: {
      id: true,
      startsAt: true,
      showroom: { select: { id: true, name: true } },
      demoVehicle: {
        select: {
          stockId: true,
          variant: {
            select: {
              name: true,
              model: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
  });
  const slotOptions = slots.map((slot) => ({
    id: slot.id,
    startsAt: slot.startsAt.toISOString(),
    showroom: slot.showroom,
    demoVehicle: {
      stockId: slot.demoVehicle.stockId,
      model: slot.demoVehicle.variant.model.name,
      variant: slot.demoVehicle.variant.name,
    },
  }));
  const vehicles = await prisma.vehicleInventory.findMany({
    where: { isDemo: false, status: "AVAILABLE" },
    select: {
      stockId: true,
      variant: {
        select: {
          name: true,
          model: { select: { name: true } },
        },
      },
    },
    orderBy: { stockId: "asc" },
  });
  const vehicleOptions = vehicles.map((vehicle) => ({
    stockId: vehicle.stockId,
    model: vehicle.variant.model.name,
    variant: vehicle.variant.name,
  }));
  return <TestDriveForm slots={slotOptions} vehicles={vehicleOptions} vehicleStockId={vehicleStockId} />;
}

export default function TestDrivePage({ searchParams }) {
  return (
    <main className="flex-1 bg-[#f7f7f5] py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Eyebrow>Test-drive request</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.05em] text-[var(--ink)] sm:text-6xl">Get to know the car from the driver’s seat.</h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">Choose an available vehicle of interest, then an active showroom and open time slot. A separate demo car is used for the appointment.</p>
          <div className="mt-8 border-l-2 border-[var(--accent)] pl-5">
            <p className="text-sm font-medium text-[var(--ink)]">What happens next?</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">A Company A consultant will follow up to confirm availability and answer your questions.</p>
          </div>
        </div>
        <Suspense fallback={<div className="min-h-96 animate-pulse border border-[var(--line)] bg-white" />}>
          <BookingForm searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
