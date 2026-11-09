import Link from "next/link";
import { notFound } from "next/navigation";
import { vehicles } from "../../../lib/mock-data";
import { formatPrice } from "../../../lib/format";
import { ButtonLink, Container, DemoNotice, Eyebrow } from "../../../components/ui";
import CarPhoto from "../../../components/car-photo";

export function generateStaticParams() {
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vehicle = vehicles.find((item) => item.stockId === slug);
  return { title: vehicle ? `${vehicle.model} | Company A` : "Vehicle | Company A" };
}

export default async function CarDetailsPage({ params }) {
  const { slug } = await params;
  const vehicle = vehicles.find((item) => item.stockId === slug);
  if (!vehicle) notFound();

  return (
    <main className="flex-1 bg-white py-8 sm:py-12">
      <Container>
        <p className="mb-6 text-xs text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">Home</Link> /{" "}
          <Link href={vehicle.condition === "New" ? "/new-cars" : "/used-cars"} className="hover:text-[var(--ink)]">
            {vehicle.condition === "New" ? "New cars" : "Pre-owned"}
          </Link>{" "}
          / {vehicle.model}
        </p>
        <div className="mb-6"><DemoNotice /></div>
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.8fr] lg:gap-12">
          <div className="space-y-3">
            <div className="aspect-[1.4/1] overflow-hidden bg-[#f1f1ef]">
              <CarPhoto src={vehicle.image} alt={vehicle.imageAlt} sizes="(min-width: 1024px) 60vw, 100vw" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[vehicle.image, vehicles[(vehicles.indexOf(vehicle) + 1) % vehicles.length].image, vehicle.image].map((image, index) => (
                <div key={`${image}-${index}`} className="aspect-[1.5/1] overflow-hidden bg-[#f1f1ef]">
                  <CarPhoto src={image} alt={vehicle.imageAlt} sizes="(min-width: 1024px) 20vw, 33vw" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Eyebrow>{vehicle.year} · {vehicle.stockId}</Eyebrow>
            <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">{vehicle.model} {vehicle.variant}</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">{vehicle.fuel} · {vehicle.status}</p>
            <p className="mt-7 border-b border-[var(--line)] pb-6 text-2xl font-medium text-[var(--ink)]">
              {formatPrice(vehicle.priceInr)}
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                {vehicle.priceBasis === "EX_SHOWROOM" ? "ex-showroom" : "listing price"}
              </span>
            </p>
            <p className="py-6 text-sm leading-7 text-[var(--muted)]">
              Vehicle details are limited to the information supplied in the project brief. The photographs are illustrative and do not depict this stock unit.
            </p>
            <div className="grid grid-cols-2 border-y border-[var(--line)]">
              {[
                ["Type", vehicle.type],
                ["Fuel", vehicle.fuel],
                ["Year", vehicle.year],
                ["Kilometres", vehicle.kilometres.toLocaleString("en-IN")],
                ["Availability", vehicle.status],
                ["Price basis", vehicle.priceBasis],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-[var(--line)] py-4 last:border-b-0">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-[var(--muted)]">{label}</p>
                  <p className="mt-1.5 text-xs font-medium text-[var(--ink)]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3">
              {vehicle.status === "AVAILABLE" ? (
                <ButtonLink href={`/book-test-drive?vehicle=${encodeURIComponent(vehicle.stockId)}`}>Request a test drive</ButtonLink>
              ) : (
                <button type="button" disabled className="min-h-12 cursor-not-allowed bg-stone-200 px-6 text-sm font-medium text-stone-600">
                  This vehicle is not available for booking
                </button>
              )}
              <ButtonLink href="/consultant/leads" variant="outline">Ask a consultant</ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
