import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import StaffLayout from "../../../../components/staff-layout";
import AiLeadPanel from "../../../../components/ai-lead-panel";
import { Badge } from "../../../../components/ui/primitives";
import ResponseTimer from "../../../../components/response-timer";
import { requirePageRole } from "@/lib/authz";
import LeadAssignmentForm from "../../../../components/lead-assignment-form";
import { getLeadDetails, getReassignableConsultants, updateLeadStatus } from "@/app/actions/consultant";

export default function LeadDetailsPage({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-[#f7f7f5]" />}>
      <LeadDetailsContent params={params} />
    </Suspense>
  );
}

async function LeadDetailsContent({ params }) {
  await requirePageRole("CONSULTANT", "ADMIN");
  const { id } = await params;
  const lead = await getLeadDetails(id);
  if (!lead) notFound();
  const consultants = await getReassignableConsultants(id);

  const latestDraft = lead.aiDrafts[0] ?? null;
  const statusLabels = {
    NEW: "New",
    CONTACTED: "Contacted",
    NEGOTIATION: "Negotiation",
    TEST_DRIVE_SCHEDULED: "Test drive scheduled",
    CONVERTED: "Converted",
    LOST: "Lost",
  };
  return (
    <StaffLayout title="Lead detail" description="Review buyer details, assignment acknowledgement, booking, and lead progress.">
      <div className="mb-5">
        <Link href="/consultant/leads" className="text-xs text-[var(--muted)] hover:text-[var(--ink)]">Back to all leads</Link>
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-[var(--line)] bg-white px-4 py-3 text-xs">
        <span>Lead reference: <strong>{lead.reference}</strong></span>
        <Badge tone={lead.status === "NEW" ? "accent" : "neutral"}>{statusLabels[lead.status]}</Badge>
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <section className="border border-[var(--line)] bg-white p-5 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">
              Received {lead.receivedAt.toLocaleString("en-IN")}
            </p>
            <h2 className="mt-2 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">{lead.customerName}</h2>
            <div className="grid gap-x-8 gap-y-6 py-6 sm:grid-cols-2">
              {[
                ["Email", lead.email ?? "Not provided"],
                ["Phone", lead.phone],
                ["Interested stock", lead.vehicle?.stockId ?? "Not specified"],
                ["Interested model / variant", lead.variant ? `${lead.variant.model.name} · ${lead.variant.name}` : "Not specified"],
                ["Preferred showroom", lead.requestedShowroom ? `${lead.requestedShowroom.name}, ${lead.requestedShowroom.city.name}` : "Not specified"],
                ["Budget", lead.budgetInr == null ? "Not provided" : `₹${lead.budgetInr.toLocaleString("en-IN")}`],
                ["Purchase timeline", lead.purchaseTimeline?.replaceAll("_", " ").toLowerCase() ?? "Not provided"],
                ["Enquiry source", lead.source.replaceAll("_", " ")],
                ["Assigned consultant", lead.assignedConsultant?.user.name ?? "Unassigned — admin queue"],
                ["Assignment time", lead.assignedAt?.toLocaleString("en-IN") ?? "Awaiting assignment"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">{label}</p>
                  <p className="mt-2 break-words text-sm text-[var(--ink)]">{value}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--line)] pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">Enquiry details</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">{lead.message || "No message supplied."}</p>
            </div>
          </section>
          {lead.testDriveBookings.map((booking) => (
            <section key={booking.id} className="border border-emerald-200 bg-white p-5 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-800">Test-drive booking · {booking.status.replaceAll("_", " ")}</p>
              <p className="mt-3 text-lg font-medium text-[var(--ink)]">
                {booking.slot.startsAt.toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">{booking.slot.showroom.name}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Demo car: {booking.slot.demoVehicle.variant.model.name} {booking.slot.demoVehicle.variant.name} · {booking.slot.demoVehicle.stockId}
              </p>
            </section>
          ))}
          <section className="border border-[var(--line)] bg-white p-5 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Internal assignment acknowledgement</p>
            {lead.notifications.length ? (
              <ul className="mt-3 space-y-3">
                {lead.notifications.map((notification) => (
                  <li key={notification.id} className="border-t border-[var(--line)] pt-3">
                    <p className="text-xs font-medium text-[var(--ink)]">{notification.type.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{notification.message}</p>
                    <p className="mt-1 text-[10px] text-[var(--muted)]">{notification.createdAt.toLocaleString("en-IN")}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-xs text-[var(--muted)]">No internal acknowledgement is recorded.</p>}
            <LeadAssignmentForm
              leadId={lead.id}
              assignedConsultantId={lead.assignedConsultantId}
              consultants={consultants}
            />
          </section>
          <section className="border border-[var(--line)] bg-white p-5 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Response time</p>
            <p className="mt-3 text-2xl font-medium tracking-[-0.04em] text-[var(--ink)]">
              {lead.firstRespondedAt
                ? "Responded"
                : <ResponseTimer receivedAt={lead.receivedAt.toISOString()} />}
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              {lead.firstRespondedAt
                ? `First response recorded ${lead.firstRespondedAt.toLocaleString("en-IN")}.`
                : "Business target: respond to new leads within five minutes."}
            </p>
          </section>
          <section className="border border-[var(--line)] bg-white p-5 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Update lead status</p>
            <form action={updateLeadStatus} className="mt-4 flex flex-wrap gap-3">
              <input type="hidden" name="leadId" value={lead.id} />
              <select className="form-input min-w-48 flex-1" name="status" defaultValue={lead.status} aria-label="Lead status">
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <button className="min-h-11 bg-[var(--ink)] px-5 text-sm font-medium text-white hover:bg-[var(--accent)]" type="submit">
                Save status
              </button>
            </form>
          </section>
        </div>
        <AiLeadPanel leadId={lead.id} draft={latestDraft} />
      </div>
    </StaffLayout>
  );
}
