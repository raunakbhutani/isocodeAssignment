import { Suspense } from "react";
import TestDriveForm from "../../components/test-drive-form";
import { Container, Eyebrow } from "../../components/ui";

export const metadata = { title: "Book a test drive | Company A" };

async function BookingForm({ searchParams }) {
  const query = await searchParams;
  const vehicleStockId = typeof query?.vehicle === "string" ? query.vehicle : "";
  return <TestDriveForm vehicleStockId={vehicleStockId} />;
}

export default function TestDrivePage({ searchParams }) {
  return (
    <main className="flex-1 bg-[#f7f7f5] py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Eyebrow>Experience it for yourself</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.05em] text-[var(--ink)] sm:text-6xl">A good car is better in person.</h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">Tell us a little about what you’re looking for. Our team can help you find a convenient time for a closer look.</p>
          <div className="mt-8 border-l-2 border-[var(--accent)] pl-5">
            <p className="text-sm font-medium text-[var(--ink)]">What happens next?</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">A Company A consultant will follow up to confirm availability and answer your questions.</p>
          </div>
        </div>
        <Suspense fallback={<div className="min-h-96 animate-pulse border border-[var(--line)] bg-white" />}>
          <BookingForm searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
