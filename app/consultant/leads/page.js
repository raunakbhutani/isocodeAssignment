import StaffLayout from "../../../components/staff-layout";
import LeadTable from "../../../components/lead-table";
import { InfoNotice } from "../../../components/ui";
import { requirePageRole } from "@/lib/authz";
import { getAssignedLeads } from "@/app/actions/consultant";

export const metadata = { title: "Consultant dashboard | DriveHub" };

const statusLabels = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  TEST_DRIVE_SCHEDULED: "Test drive scheduled",
  WON: "Won",
  LOST: "Lost",
};

export default async function ConsultantLeadsPage() {
  await requirePageRole("CONSULTANT", "ADMIN");
  const records = await getAssignedLeads();
  const leads = records.map((lead) => {
    return {
      id: lead.id,
      name: lead.customerName,
      vehicleStockId: lead.vehicle?.stockId ?? "No vehicle selected",
      source: lead.source.replaceAll("_", " "),
      status: statusLabels[lead.status],
      assignedTo: lead.assignedConsultant?.user.name ?? "Unassigned",
      receivedAt: lead.receivedAt.toISOString(),
    };
  });
  const newLeads = records.filter((lead) => lead.status === "NEW").length;
  const activeLeads = records.length;

  return (
    <StaffLayout title="Consultant dashboard" description="Lead overview, inbox, status, and response-time context for the consultant team.">
      <div className="mb-6">
        <InfoNotice title="Response target from the brief:">
          New website leads are assigned immediately to an active consultant. The five-minute target is a business response goal, not an automated notification.
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
