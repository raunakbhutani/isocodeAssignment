import StaffLayout from "../../../components/staff-layout";
import LeadTable from "../../../components/lead-table";
import { leads } from "../../../lib/mock-data";
import { InfoNotice } from "../../../components/ui";

export const metadata = { title: "Consultant dashboard | DriveHub" };

export default function ConsultantLeadsPage() {
  const newLeads = leads.filter((lead) => lead.status === "New").length;
  const activeLeads = leads.length;

  return (
    <StaffLayout title="Consultant dashboard" description="Lead overview, inbox, status, and response-time context for the consultant team.">
      <div className="mb-6">
        <InfoNotice title="Response target from the brief:">
          New website leads should reach a consultant within five minutes. These demo records have no live receipt time or assignment.
        </InfoNotice>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Demo inbox", activeLeads, "Fictional placeholder leads"],
          ["New demo leads", newLeads, "No live enquiries connected"],
          ["Response goal", "< 5 min", "Business requirement"],
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
