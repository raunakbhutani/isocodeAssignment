import { vehicles } from "../../lib/mock-data";
import ListingExplorer from "../../components/listing-explorer";
import { Container, Eyebrow } from "../../components/ui";

export const metadata = { title: "New cars | Company A" };

export default function NewCarsPage() {
  const newVehicles = vehicles.filter((vehicle) => vehicle.condition === "New");

  return (
    <main className="flex-1 bg-[#f7f7f5] py-12 sm:py-16">
      <Container>
        <div className="mb-9 max-w-2xl">
          <Eyebrow>The new collection</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] text-[var(--ink)] sm:text-6xl">New cars, made for what’s next.</h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">Explore the latest Company A models, from considered electric performance to refined everyday comfort.</p>
        </div>
        <ListingExplorer vehicles={newVehicles} />
      </Container>
    </main>
  );
}

