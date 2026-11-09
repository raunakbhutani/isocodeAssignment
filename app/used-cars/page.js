import { vehicles } from "../../lib/mock-data";
import ListingExplorer from "../../components/listing-explorer";
import { Container, Eyebrow } from "../../components/ui";

export const metadata = { title: "Used cars | DriveHub" };

export default function UsedCarsPage() {
  const usedVehicles = vehicles.filter((vehicle) => vehicle.type === "USED");

  return (
    <main className="flex-1 bg-[#f7f7f5] py-12 sm:py-16">
      <Container>
        <div className="mb-9 max-w-2xl">
          <Eyebrow>Brand X · Used cars</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] text-[var(--ink)] sm:text-6xl">Used cars, with the details up front.</h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">View the two used-car records supplied for this project, including their listing prices and availability.</p>
        </div>
        <ListingExplorer vehicles={usedVehicles} used />
        <div className="mt-10 border border-[var(--line)] bg-white p-6 sm:p-8">
          <Eyebrow>Inspection information</Eyebrow>
          <h2 className="mt-3 text-2xl font-medium text-[var(--ink)]">Reports will appear with verified vehicle records.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            No inspection reports, previous-owner counts, or registration numbers were supplied for these sample records. No such details have been invented.
          </p>
        </div>
      </Container>
    </main>
  );
}
