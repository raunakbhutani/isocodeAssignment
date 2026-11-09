import { vehicles } from "../../lib/mock-data";
import ListingExplorer from "../../components/listing-explorer";
import { Container, Eyebrow } from "../../components/ui";

export const metadata = { title: "New cars | DriveHub" };

export default function NewCarsPage() {
  const newVehicles = vehicles.filter((vehicle) => vehicle.type === "NEW");

  return (
    <main className="flex-1 bg-[#f7f7f5] py-12 sm:py-16">
      <Container>
        <div className="mb-9 max-w-2xl">
          <Eyebrow>Brand X · New cars</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] text-[var(--ink)] sm:text-6xl">New cars, clearly presented.</h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">Browse new-car records supplied for this project. The listed price for NEW-H-02 is ex-showroom, not on-road.</p>
        </div>
        <ListingExplorer vehicles={newVehicles} />
      </Container>
    </main>
  );
}
