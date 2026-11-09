import { vehicles } from "../../lib/mock-data";
import ListingExplorer from "../../components/listing-explorer";
import { Container, Eyebrow } from "../../components/ui";

export const metadata = { title: "Pre-owned cars | Company A" };

export default function UsedCarsPage() {
  const usedVehicles = vehicles.filter((vehicle) => vehicle.condition === "Pre-owned");

  return (
    <main className="flex-1 bg-[#f7f7f5] py-12 sm:py-16">
      <Container>
        <div className="mb-9 max-w-2xl">
          <Eyebrow>Considered again</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] text-[var(--ink)] sm:text-6xl">Pre-owned, with a little more thought.</h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">Explore a hand-selected collection of sample pre-owned vehicles. Each listing shown here is illustrative.</p>
        </div>
        <ListingExplorer vehicles={usedVehicles} />
      </Container>
    </main>
  );
}

