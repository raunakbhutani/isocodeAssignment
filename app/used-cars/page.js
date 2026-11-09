import ListingExplorer from "../../components/listing-explorer";
import { Container, Eyebrow } from "../../components/ui";
import { connection } from "next/server";
import { listPublicVehicles } from "@/lib/vehicle-queries";

export const metadata = { title: "Used cars | DriveHub" };

export default async function UsedCarsPage() {
  await connection();
  const usedVehicles = await listPublicVehicles("USED");

  return (
    <main className="flex-1 bg-[#f7f7f5] py-12 sm:py-16">
      <Container>
        <div className="mb-9 max-w-2xl">
          <Eyebrow>Brand X · Used cars</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] text-[var(--ink)] sm:text-6xl">Used cars, with the details up front.</h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">View current used-car inventory, with listing prices, mileage, history fields, and availability.</p>
        </div>
        <ListingExplorer vehicles={usedVehicles} used />
        <div className="mt-10 border border-[var(--line)] bg-white p-6 sm:p-8">
          <Eyebrow>Inspection information</Eyebrow>
          <h2 className="mt-3 text-2xl font-medium text-[var(--ink)]">Reports will appear with verified vehicle records.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Owner and inspection details marked as assumptions are demo-only and must be replaced with verified records. No full vehicle registration numbers are displayed.
          </p>
        </div>
      </Container>
    </main>
  );
}
