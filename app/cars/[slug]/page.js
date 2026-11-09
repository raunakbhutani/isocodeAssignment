import Link from "next/link";
import { Suspense } from "react";
import { displayAvailability, formatPrice } from "../../../lib/format";
import { ButtonLink, Container, DemoNotice, Eyebrow, InfoNotice } from "../../../components/ui";
import CarGallery from "../../../components/car-gallery";
import CityPricePanel from "../../../components/city-price-panel";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPublicVehicle } from "@/lib/vehicle-queries";
import { notFound } from "next/navigation";
import { BuyerText } from "@/components/buyer-language-provider";

export async function generateMetadata({ params }) {
  await connection();
  const { slug } = await params;
  const vehicle = await getPublicVehicle(slug);
  return { title: vehicle ? `${vehicle.model} ${vehicle.variant} | DriveHub` : "Vehicle | DriveHub" };
}

export default function CarDetailsPage({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-[#f7f7f5]" />}>
      <CarDetailsContent params={params} />
    </Suspense>
  );
}

async function CarDetailsContent({ params }) {
  await connection();
  const { slug } = await params;
  const vehicle = await getPublicVehicle(slug);
  if (!vehicle) notFound();
  const cities = vehicle.type === "NEW"
    ? await prisma.city.findMany({
        where: { prices: { some: { variantId: vehicle.variantId } } },
        select: { id: true, name: true, state: true },
        orderBy: [{ name: "asc" }, { state: "asc" }],
      })
    : [];

  return (
    <main className="flex-1 bg-white py-8 sm:py-12">
      <Container>
        <p className="mb-6 text-xs text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">Home</Link> /{" "}
          <Link href={vehicle.type === "NEW" ? "/new-cars" : "/used-cars"} className="hover:text-[var(--ink)]">
            {vehicle.type === "NEW" ? "New cars" : "Used cars"}
          </Link>{" "}
          / {vehicle.model}
        </p>
        <div className="mb-6"><DemoNotice /></div>
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.8fr] lg:gap-12">
          <CarGallery stockId={vehicle.stockId} model={vehicle.model} images={vehicle.images} />
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Eyebrow><BuyerText>{vehicle.type === "NEW" ? "New" : "Used"}</BuyerText> · {vehicle.stockId}</Eyebrow>
            <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">{vehicle.model} {vehicle.variant}</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">{vehicle.fuel.charAt(0) + vehicle.fuel.slice(1).toLowerCase()} · {vehicle.year} · {displayAvailability(vehicle.status)}</p>
            <p className="mt-7 border-b border-[var(--line)] pb-6 text-2xl font-medium text-[var(--ink)]">
              {formatPrice(vehicle.priceInr)}
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                <BuyerText>{vehicle.priceBasis === "EX_SHOWROOM" ? "ex-showroom" : "listing price"}</BuyerText>
              </span>
            </p>
            <div className="grid grid-cols-2 border-y border-[var(--line)]">
              {[
                ["Stock ID", vehicle.stockId],
                ["Model", vehicle.model],
                ["Variant", vehicle.variant],
                ["Fuel", vehicle.fuel.charAt(0) + vehicle.fuel.slice(1).toLowerCase()],
                ["Year", vehicle.year],
                ["Kilometres", `${vehicle.kilometres.toLocaleString("en-IN")} km`],
                ["Availability", displayAvailability(vehicle.status)],
                ["Price basis", vehicle.priceBasis === "EX_SHOWROOM" ? "Ex-showroom" : "Listing price"],
                ...(vehicle.type === "USED"
                  ? [[
                      "Previous owners",
                      vehicle.previousOwners == null
                        ? "Not supplied"
                        : `${vehicle.previousOwners}${vehicle.detailsAreAssumed ? " (assumed demo value)" : ""}`,
                    ]]
                  : []),
              ].map(([label, value]) => (
                <div key={label} className="border-b border-[var(--line)] py-4 last:border-b-0">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-[var(--muted)]"><BuyerText>{label}</BuyerText></p>
                  <p className="mt-1.5 text-xs font-medium text-[var(--ink)]">{value}</p>
                </div>
              ))}
            </div>
            {vehicle.type === "USED" && (
              <section className="mt-6 border border-[var(--line)] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]"><BuyerText>Inspection report</BuyerText></p>
                <h2 className="mt-2 text-base font-medium text-[var(--ink)]">
                  {vehicle.inspectionReport
                    ? (vehicle.detailsAreAssumed ? "Assumed demo report" : "Inspection report")
                    : "Report not supplied"}
                </h2>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  {vehicle.inspectionReport ?? "No inspection document was supplied. No full vehicle registration number is displayed."}
                  {vehicle.detailsAreAssumed && " This is an assumption for demonstration only, not a verified inspection result."}
                </p>
              </section>
            )}
            {vehicle.type === "NEW" && (
              <CityPricePanel variantId={vehicle.variantId} cities={cities} />
            )}
            <div className="mt-7 flex flex-col gap-3">
              {vehicle.status === "AVAILABLE" ? (
                <ButtonLink href={`/book-test-drive?vehicle=${encodeURIComponent(vehicle.stockId)}`}><BuyerText>Request a test drive</BuyerText></ButtonLink>
              ) : (
                <button type="button" disabled className="min-h-12 cursor-not-allowed bg-stone-200 px-6 text-sm font-medium text-stone-600">
                  This vehicle is not available for booking
                </button>
              )}
              <ButtonLink href={`/enquiry?vehicle=${encodeURIComponent(vehicle.stockId)}`} variant="outline"><BuyerText>Send an enquiry</BuyerText></ButtonLink>
            </div>
            {vehicle.status === "BOOKED" && (
              <div className="mt-4">
                <InfoNotice title="Booked:">This vehicle is not available for a test-drive request.</InfoNotice>
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
