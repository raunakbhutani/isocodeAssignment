import Link from "next/link";
import VehicleCard from "../components/vehicle-card";
import CarPhoto from "../components/car-photo";
import { ButtonLink, Container, DemoNotice, Eyebrow, InfoNotice } from "../components/ui";
import { connection } from "next/server";
import { listPublicVehicles } from "@/lib/vehicle-queries";

export const metadata = {
  title: "DriveHub | Company A · Brand X",
  description: "Explore new and used Brand X vehicles at Company A in Lucknow.",
};

export default async function Home() {
  await connection();
  const [newVehicles, usedVehicles] = await Promise.all([
    listPublicVehicles("NEW"),
    listPublicVehicles("USED"),
  ]);
  const featuredNewVehicles = newVehicles.slice(0, 3);
  const featuredUsedVehicles = usedVehicles.slice(0, 3);

  return (
    <main className="flex-1">
      <section className="relative flex min-h-[600px] items-end overflow-hidden bg-[#292c2c] sm:min-h-[690px]">
        <CarPhoto
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90"
          alt="Placeholder photograph of a premium automobile on a road"
          className="object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/5" />
        <Container className="relative z-10 pb-16 pt-28 sm:pb-24">
          <div className="max-w-2xl text-white">
            <Eyebrow light>Company A · Authorized Brand X dealer</Eyebrow>
            <h1 className="mt-6 text-5xl font-medium leading-[0.98] tracking-[-0.06em] sm:text-7xl">
              A more considered<br />way to find your car.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              Discover new and pre-owned Brand X vehicles with the local team at Company A, in Lucknow, Uttar Pradesh.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/new-cars">Explore new cars</ButtonLink>
              <ButtonLink href="/used-cars" variant="light">Browse used cars</ButtonLink>
            </div>
          </div>
        </Container>
        <p className="absolute bottom-5 right-6 hidden text-[10px] uppercase tracking-[0.14em] text-white/75 md:block">
          Placeholder photography · not Company A inventory
        </p>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <Container><DemoNotice /></Container>
      </section>

      <section className="bg-white pb-16 pt-8 sm:pb-24">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <Eyebrow>New from Brand X</Eyebrow>
              <h2 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-[var(--ink)] sm:text-4xl">A new drive begins here.</h2>
            </div>
            <Link href="/new-cars" className="hidden text-sm font-medium text-[var(--ink)] underline decoration-[var(--accent)] underline-offset-8 sm:block">All new cars ↗</Link>
          </div>
          {featuredNewVehicles.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredNewVehicles.map((vehicle) => <VehicleCard key={vehicle.stockId} vehicle={vehicle} />)}
            </div>
          ) : <EmptyShowroom text="No new vehicle details are currently available." />}
        </Container>
      </section>

      <section className="bg-[#f7f7f5] py-16 sm:py-24">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <Eyebrow>Pre-owned, considered</Eyebrow>
              <h2 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-[var(--ink)] sm:text-4xl">Find the right next chapter.</h2>
            </div>
            <Link href="/used-cars" className="hidden text-sm font-medium text-[var(--ink)] underline decoration-[var(--accent)] underline-offset-8 sm:block">All used cars ↗</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredUsedVehicles.map((vehicle) => <VehicleCard key={vehicle.stockId} vehicle={vehicle} />)}
          </div>
          {featuredUsedVehicles.length === 0 && <EmptyShowroom text="No used vehicle details are currently available." />}
          <div className="mt-7 sm:hidden">
            <ButtonLink href="/used-cars" variant="secondary" className="w-full">Browse used cars</ButtonLink>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <Container className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          <div className="relative aspect-[1.2/1] overflow-hidden bg-[#e8e7e3]">
            <CarPhoto
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85"
              alt="Placeholder photograph of a premium vehicle"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <span className="absolute bottom-3 left-3 bg-white/90 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-[var(--ink)]">Placeholder image</span>
          </div>
          <div className="max-w-xl">
            <Eyebrow>Come see it for yourself</Eyebrow>
            <h2 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">
              The best way to know is to take the wheel.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
              Request a test drive and tell us what works for you. Showroom names, demo cars, and live slots will be confirmed when dealership details are connected.
            </p>
            <ButtonLink href="/book-test-drive" className="mt-7">Request a test drive</ButtonLink>
          </div>
        </Container>
      </section>

      <section id="showrooms" className="bg-[#f7f7f5] py-16 sm:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <Eyebrow>Here in Lucknow</Eyebrow>
              <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">A local team, ready to help.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Company A operates three showrooms, two service workshops, and a certified used-car yard in Lucknow. Individual branch names and addresses were not included in the brief.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["03", "Showrooms", "Company A facility count"],
              ["02", "Service workshops", "Company A facility count"],
              ["01", "Certified used-car yard", "Company A facility count"],
            ].map(([number, label, note]) => (
              <div key={label} className="border border-[var(--line)] bg-white p-6">
                <p className="text-3xl font-medium tracking-[-0.04em] text-[var(--accent)]">{number}</p>
                <p className="mt-3 text-sm font-medium text-[var(--ink)]">{label}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <InfoNotice title="Location details to confirm:">
              Individual showroom and workshop addresses are not available in the supplied brief, so none are displayed here.
            </InfoNotice>
          </div>
        </Container>
      </section>
    </main>
  );
}

function EmptyShowroom({ text }) {
  return <div className="border border-dashed border-[var(--line)] px-6 py-12 text-center text-sm text-[var(--muted)]">{text}</div>;
}
