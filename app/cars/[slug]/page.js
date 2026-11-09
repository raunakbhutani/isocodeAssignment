import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { vehicles } from "../../../lib/mock-data";
import { displayAvailability, formatPrice } from "../../../lib/format";
import { ButtonLink, Container, DemoNotice, Eyebrow, InfoNotice } from "../../../components/ui";
import CarGallery from "../../../components/car-gallery";
import CityPricePanel from "../../../components/city-price-panel";

export function generateStaticParams() {
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vehicle = vehicles.find((item) => item.stockId === slug);
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
  const { slug } = await params;
  const vehicle = vehicles.find((item) => item.stockId === slug);
  if (!vehicle) notFound();

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
          <CarGallery stockId={vehicle.stockId} model={vehicle.model} />
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Eyebrow>{vehicle.type === "NEW" ? "New" : "Used"} · {vehicle.stockId}</Eyebrow>
            <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">{vehicle.model} {vehicle.variant}</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">{vehicle.fuel.charAt(0) + vehicle.fuel.slice(1).toLowerCase()} · {vehicle.year} · {displayAvailability(vehicle.status)}</p>
            <p className="mt-7 border-b border-[var(--line)] pb-6 text-2xl font-medium text-[var(--ink)]">
              {formatPrice(vehicle.priceInr)}
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                {vehicle.priceBasis === "EX_SHOWROOM" ? "ex-showroom" : "listing price"}
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
                ...(vehicle.type === "USED" ? [["Previous owners", "Not supplied"], ["Registration", "Not supplied"]] : []),
              ].map(([label, value]) => (
                <div key={label} className="border-b border-[var(--line)] py-4 last:border-b-0">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-[var(--muted)]">{label}</p>
                  <p className="mt-1.5 text-xs font-medium text-[var(--ink)]">{value}</p>
                </div>
              ))}
            </div>
            {vehicle.type === "USED" && (
              <section className="mt-6 border border-[var(--line)] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">Inspection report</p>
                <h2 className="mt-2 text-base font-medium text-[var(--ink)]">Report not supplied</h2>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  No inspection document was included with the project data. Registration details are not shown because none were supplied.
                </p>
              </section>
            )}
            <CityPricePanel vehicle={vehicle} />
            <div className="mt-7 flex flex-col gap-3">
              {vehicle.status === "AVAILABLE" ? (
                <ButtonLink href={`/book-test-drive?vehicle=${encodeURIComponent(vehicle.stockId)}`}>Request a test drive</ButtonLink>
              ) : (
                <button type="button" disabled className="min-h-12 cursor-not-allowed bg-stone-200 px-6 text-sm font-medium text-stone-600">
                  This vehicle is not available for booking
                </button>
              )}
              <ButtonLink href={`/enquiry?vehicle=${encodeURIComponent(vehicle.stockId)}`} variant="outline">Send an enquiry</ButtonLink>
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
