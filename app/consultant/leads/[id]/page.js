import Link from "next/link";
import { notFound } from "next/navigation";
import StaffLayout from "../../../../components/staff-layout";
import { leads } from "../../../../lib/mock-data";

export function generateStaticParams() {
  return leads.map((lead) => ({ id: lead.id }));
}

export default async function LeadDetailsPage({ params }) {
  const { id } = await params;
  const lead = leads.find((item) => item.id === id);
  if (!lead) notFound();

  return (
    <StaffLayout title="Lead details" description={`A sample customer enquiry for ${lead.vehicle}.`}>
      <div className="mb-5">
        <Link href="/consultant/leads" className="text-xs text-[var(--muted)] hover:text-[var(--ink)]">← Back to all leads</Link>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="border border-[var(--line)] bg-white p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] pb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{lead.id} · {lead.date}</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">{lead.name}</h2>
            </div>
            <span className="bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">{lead.status}</span>
          </div>
          <div className="grid gap-x-8 gap-y-6 py-6 sm:grid-cols-2">
            {[
              ["Email", lead.email],
              ["Phone", lead.phone],
              ["Interested in", lead.vehicle],
              ["Enquiry source", lead.source],
              ["Assigned consultant", lead.owner],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">{label}</p>
                <p className="mt-2 text-sm text-[var(--ink)]">{value}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--line)] pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">Customer note</p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{lead.interest}</p>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="border border-[var(--line)] bg-white p-5 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">Suggested next step</p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink)]">{lead.nextStep}</p>
            <button type="button" disabled className="mt-6 h-11 w-full cursor-not-allowed bg-[var(--ink)] px-4 text-xs font-medium text-white opacity-50">
              Activity actions are not connected
            </button>
          </section>
          <section className="border border-[var(--line)] bg-white p-5 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Activity</p>
            <div className="mt-5 border-l border-[var(--line)] pl-4">
              <p className="text-xs font-medium text-[var(--ink)]">Enquiry received</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{lead.date} · via {lead.source}</p>
            </div>
            <p className="mt-5 text-[10px] leading-5 text-[var(--muted)]">Timeline is illustrative. Activity history is not connected to a service.</p>
          </section>
        </aside>
      </div>
    </StaffLayout>
  );
}
