import { Suspense } from "react";
import EnquiryForm from "../../components/enquiry-form";
import { Container, Eyebrow } from "../../components/ui";

export const metadata = { title: "Send an enquiry | DriveHub" };

async function EnquiryFormWithVehicle({ searchParams }) {
  const params = await searchParams;
  const vehicleStockId = typeof params?.vehicle === "string" ? params.vehicle : "";
  return <EnquiryForm vehicleStockId={vehicleStockId} />;
}

export default function EnquiryPage({ searchParams }) {
  return (
    <main className="flex-1 bg-[#f7f7f5] py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Eyebrow>Talk to Company A</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.05em] text-[var(--ink)] sm:text-6xl">Tell us what you’d like to know.</h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
            Share a question about a listed vehicle. A real enquiry service and consultant assignment are not connected in this frontend phase.
          </p>
        </div>
        <Suspense fallback={<div className="min-h-96 animate-pulse border border-[var(--line)] bg-white" />}>
          <EnquiryFormWithVehicle searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
