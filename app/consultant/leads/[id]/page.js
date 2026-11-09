import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import StaffLayout from "../../../../components/staff-layout";
import { leads, vehicles } from "../../../../lib/mock-data";
import AiLeadPanel from "../../../../components/ai-lead-panel";
import { Badge } from "../../../../components/ui/primitives";

export function generateStaticParams() {
  return leads.map((lead) => ({ id: lead.id }));
}

export default function LeadDetailsPage({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-[#f7f7f5]" />}>
      <LeadDetailsContent params={params} />
    </Suspense>
  );
}

async function LeadDetailsContent({ params }) {
  const { id } = await params;
  const lead = leads.find((item) => item.id === id);
  if (!lead) notFound();
  const vehicle = vehicles.find((item) => item.stockId === lead.vehicleStockId);

  return (
    <StaffLayout title="Lead detail" description="Buyer information, enquiry context, and a review-only first-reply draft.">
      <div className="mb-5">
        <Link href="/consultant/leads" className="text-xs text-[var(--muted)] hover:text-[var(--ink)]">← Back to all leads</Link>
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950">
        <span><strong>Demo record:</strong> buyer and enquiry details below are fictional placeholders.</span>
        <Badge tone="accent">{lead.status}</Badge>
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <section className="border border-[var(--line)] bg-white p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] pb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{lead.id} · {lead.receivedAt}</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">{lead.name}</h2>
            </div>
          </div>
          <div className="grid gap-x-8 gap-y-6 py-6 sm:grid-cols-2">
            {[
              ["Email", lead.email],
              ["Phone", lead.phone],
              ["Interested stock", vehicle ? `${vehicle.model} ${vehicle.variant} · ${vehicle.stockId}` : lead.vehicleStockId],
              ["Enquiry source", lead.source],
              ["Assigned consultant", lead.assignedTo],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">{label}</p>
                <p className="mt-2 text-sm text-[var(--ink)]">{value}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--line)] pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">Enquiry details</p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{lead.enquiry}</p>
          </div>
          </section>
          <section className="border border-[var(--line)] bg-white p-5 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Response timer</p>
            <p className="mt-3 text-2xl font-medium tracking-[-0.04em] text-[var(--ink)]">Not active</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{lead.responseTimer}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">Brief target: consultant receives new leads within five minutes.</p>
          </section>
          <section className="border border-[var(--line)] bg-white p-5 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Assignment</p>
            <p className="mt-3 text-sm text-[var(--ink)]">{lead.assignedTo}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Automatic assignment is part of the planned backend, not this UI preview.</p>
          </section>
        </div>
        <AiLeadPanel summary={lead.aiSummary} firstReply={lead.firstReply} />
      </div>
    </StaffLayout>
  );
}
