import { Suspense } from "react";
import EnquiryForm from "../../components/enquiry-form";
import { Container, Eyebrow } from "../../components/ui";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { BuyerText } from "@/components/buyer-language-provider";

export const metadata = { title: "Send an enquiry | DriveHub" };

async function EnquiryFormWithVehicle({ searchParams }) {
  await connection();
  const params = await searchParams;
  const vehicleStockId = typeof params?.vehicle === "string" ? params.vehicle : "";
  const [inventory, showrooms] = await Promise.all([
    prisma.vehicleInventory.findMany({
      where: { isDemo: false },
      select: {
        stockId: true,
        type: true,
        status: true,
        variant: { select: { name: true, model: { select: { name: true } } } },
      },
      orderBy: { stockId: "asc" },
    }),
    prisma.showroom.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const vehicles = inventory.map((vehicle) => ({
    stockId: vehicle.stockId,
    type: vehicle.type,
    status: vehicle.status,
    model: vehicle.variant.model.name,
    variant: vehicle.variant.name,
  }));
  return <EnquiryForm vehicleStockId={vehicleStockId} vehicles={vehicles} showrooms={showrooms} />;
}

export default function EnquiryPage({ searchParams }) {
  return (
    <main className="flex-1 bg-[#f7f7f5] py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Eyebrow>Talk to Company A</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.05em] text-[var(--ink)] sm:text-6xl"><BuyerText>Tell us what you’d like to know.</BuyerText></h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
            Share what you are looking for and the right consultant will be selected for your showroom and vehicle interest when possible.
          </p>
        </div>
        <Suspense fallback={<div className="min-h-96 animate-pulse border border-[var(--line)] bg-white" />}>
          <EnquiryFormWithVehicle searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
