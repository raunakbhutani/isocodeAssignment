import ListingExplorer from "../../components/listing-explorer";
import { Container, Eyebrow } from "../../components/ui";
import { connection } from "next/server";
import { listPublicVehicles } from "@/lib/vehicle-queries";
import { BuyerText } from "@/components/buyer-language-provider";

export const metadata = { title: "New cars | DriveHub" };

export default async function NewCarsPage() {
  await connection();
  const newVehicles = await listPublicVehicles("NEW");

  return (
    <main className="flex-1 bg-[#f7f7f5] py-12 sm:py-16">
      <Container>
        <div className="mb-9 max-w-2xl">
          <Eyebrow>Brand X · New cars</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] text-[var(--ink)] sm:text-6xl"><BuyerText>New cars, clearly presented.</BuyerText></h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]"><BuyerText>Browse current new-car inventory. The listed price for NEW-H-02 is ex-showroom, not on-road.</BuyerText></p>
        </div>
        <ListingExplorer vehicles={newVehicles} />
      </Container>
    </main>
  );
}
