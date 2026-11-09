import StaffLayout from "../../../components/staff-layout";
import LeadTable from "../../../components/lead-table";
import { InfoNotice } from "../../../components/ui";
import { requirePageRole } from "@/lib/authz";
import { getAssignedLeads } from "@/app/actions/consultant";

export const metadata = { title: "Consultant dashboard | DriveHub" };

const statusLabels = {
  NEW: "New",
  CONTACTED: "Contacted",
  NEGOTIATION: "Negotiation",
  TEST_DRIVE_SCHEDULED: "Test drive scheduled",
  CONVERTED: "Converted",
  LOST: "Lost",
};

export default async function ConsultantLeadsPage() {
  const user = await requirePageRole("CONSULTANT", "ADMIN");
  const records = await getAssignedLeads();
  const leads = records.map((lead) => {
    return {
      id: lead.id,
      reference: lead.reference,
      name: lead.customerName,
      vehicle: lead.variant ? `${lead.variant.model.name} ${lead.variant.name}` : lead.vehicle?.stockId ?? "No vehicle selected",
      vehicleStockId: lead.vehicle?.stockId ?? "No stock selected",
      source: lead.source.replaceAll("_", " "),
      status: statusLabels[lead.status],
      assignedTo: lead.assignedConsultant?.user.name ?? "Unassigned",
      showroom: lead.requestedShowroom?.name ?? "No showroom selected",
      receivedAt: lead.receivedAt.toISOString(),
      assignedAt: lead.assignedAt?.toISOString() ?? null,
      firstRespondedAt: lead.firstRespondedAt?.toISOString() ?? null,
      booking: lead.testDriveBookings[0] ? {
        startsAt: lead.testDriveBookings[0].slot.startsAt.toISOString(),
        showroom: lead.testDriveBookings[0].slot.showroom.name,
        demoVehicle: `${lead.testDriveBookings[0].slot.demoVehicle.variant.model.name} ${lead.testDriveBookings[0].slot.demoVehicle.variant.name}`,
      } : null,
    };
  });
  const newLeads = records.filter((lead) => lead.status === "NEW").length;
  const activeLeads = records.length;
  const unassignedLeads = records.filter((lead) => !lead.assignedConsultantId).length;

  return (
    <StaffLayout title={user.role === "ADMIN" ? "Lead inbox and admin queue" : "Consultant dashboard"} description="Lead details, showroom and consultant assignment, test-drive bookings, response target, and status.">
      <div className="mb-6">
        <InfoNotice title="Response target from the brief:">
          Assignment is attempted immediately using showroom/model eligibility. The five-minute response target is monitored here; no WhatsApp or SMS is sent.
        </InfoNotice>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Visible leads", activeLeads, user.role === "ADMIN" ? "Includes unassigned admin queue" : "Current assignments only"],
          ["New leads", newLeads, "Awaiting first response"],
          ["Unassigned", unassignedLeads, user.role === "ADMIN" ? "Admin assignment required" : "Visible to admins only"],
        ].map(([label, value, note]) => (
          <div key={label} className="border border-[var(--line)] bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{label}</p>
            <p className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">{value}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
          </div>
        ))}
      </div>
      <LeadTable leads={leads} isAdmin={user.role === "ADMIN"} />
    </StaffLayout>
  );
}
