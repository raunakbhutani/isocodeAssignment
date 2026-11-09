import StaffLayout from "../../../components/staff-layout";
import LeadTable from "../../../components/lead-table";
import { leads } from "../../../lib/mock-data";

export const metadata = { title: "Consultant leads | Company A" };

export default function ConsultantLeadsPage() {
  const newLeads = leads.filter((lead) => lead.status === "New").length;
  const activeLeads = leads.filter((lead) => lead.status !== "Qualified").length;

  return (
    <StaffLayout title="Lead overview" description="A clear view of customer enquiries and the next conversations to have.">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Open leads", activeLeads, "Across all sample sources"],
          ["New today", newLeads, "Awaiting first contact"],
          ["Test drive requests", 3, "Sample requests this week"],
        ].map(([label, value, note]) => (
          <div key={label} className="border border-[var(--line)] bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{label}</p>
            <p className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">{value}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
          </div>
        ))}
      </div>
      <LeadTable leads={leads} />
    </StaffLayout>
  );
}

