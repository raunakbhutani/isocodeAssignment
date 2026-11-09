"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "./ui/primitives";
import ResponseTimer from "./response-timer";

const statuses = ["All statuses", "New", "Contacted", "Test drive scheduled", "Negotiation", "Converted", "Lost"];

export default function LeadTable({ leads, isAdmin = false }) {
  const [status, setStatus] = useState("All statuses");
  const [assignment, setAssignment] = useState("All assignments");
  const [showroom, setShowroom] = useState("All showrooms");
  const [query, setQuery] = useState("");
  const showrooms = ["All showrooms", ...new Set(leads.map((lead) => lead.showroom))];

  const visibleLeads = useMemo(
    () => leads.filter((lead) => {
      const matchesStatus = status === "All statuses" || lead.status === status;
      const matchesAssignment = assignment === "All assignments" ||
        (assignment === "Unassigned" ? lead.assignedTo === "Unassigned" : lead.assignedTo !== "Unassigned");
      const matchesShowroom = showroom === "All showrooms" || lead.showroom === showroom;
      const haystack = [
        lead.name,
        lead.vehicle,
        lead.vehicleStockId,
        lead.showroom,
        lead.assignedTo,
        lead.reference,
        lead.id,
      ].join(" ").toLowerCase();
      return matchesStatus && matchesAssignment && matchesShowroom && haystack.includes(query.toLowerCase());
    }),
    [assignment, leads, query, showroom, status],
  );

  return (
    <>
      <div className={`mb-5 grid gap-3 ${isAdmin ? "md:grid-cols-[1fr_auto_auto_auto]" : "md:grid-cols-[1fr_auto_auto]"}`}>
        <label className="sr-only" htmlFor="lead-search">Search leads</label>
        <input
          id="lead-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, model, showroom, consultant, or reference"
          className="h-11 min-w-0 border border-[var(--line)] bg-white px-4 text-sm outline-none focus:border-[var(--accent)]"
        />
        <label className="sr-only" htmlFor="lead-status-filter">Filter by status</label>
        <select id="lead-status-filter" className="h-11 border border-[var(--line)] bg-white px-3 text-xs" value={status} onChange={(event) => setStatus(event.target.value)}>
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <label className="sr-only" htmlFor="lead-showroom-filter">Filter by showroom</label>
        <select id="lead-showroom-filter" className="h-11 border border-[var(--line)] bg-white px-3 text-xs" value={showroom} onChange={(event) => setShowroom(event.target.value)}>
          {showrooms.map((item) => <option key={item}>{item}</option>)}
        </select>
        {isAdmin && (
          <label className="sr-only" htmlFor="lead-assignment-filter">Filter by assignment</label>
        )}
        {isAdmin && (
          <select id="lead-assignment-filter" className="h-11 border border-[var(--line)] bg-white px-3 text-xs" value={assignment} onChange={(event) => setAssignment(event.target.value)}>
            {["All assignments", "Assigned", "Unassigned"].map((item) => <option key={item}>{item}</option>)}
          </select>
        )}
      </div>

      <div className="overflow-x-auto border border-[var(--line)] bg-white">
        <table className="w-full min-w-[920px] text-left text-xs">
          <thead className="bg-[#fbfbfa] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Buyer / created</th>
              <th className="px-4 py-3">Interested vehicle</th>
              <th className="px-4 py-3">Showroom / assignment</th>
              <th className="px-4 py-3">Response target</th>
              <th className="px-4 py-3">Status / booking</th>
            </tr>
          </thead>
          <tbody>
            {visibleLeads.map((lead) => (
              <tr key={lead.id} className="border-t border-[var(--line)] align-top hover:bg-[#fcfcfb]">
                <td className="px-4 py-4">
                  <Link href={`/consultant/leads/${lead.id}`} className="font-medium text-[var(--ink)] hover:underline">{lead.name}</Link>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">{lead.reference} · {new Date(lead.receivedAt).toLocaleString("en-IN")}</p>
                </td>
                <td className="px-4 py-4">
                  <p>{lead.vehicle}</p>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">{lead.vehicleStockId}</p>
                </td>
                <td className="px-4 py-4">
                  <p>{lead.showroom}</p>
                  <p className="mt-1">{lead.assignedTo}</p>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    {lead.assignedAt ? `Assigned ${new Date(lead.assignedAt).toLocaleString("en-IN")}` : "Awaiting admin assignment"}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <ResponseTimer receivedAt={lead.receivedAt} firstRespondedAt={lead.firstRespondedAt} />
                </td>
                <td className="px-4 py-4">
                  <Badge tone={lead.status === "New" ? "accent" : "neutral"}>{lead.status}</Badge>
                  {lead.booking && (
                    <p className="mt-2 leading-5 text-emerald-800">
                      Test drive: {new Date(lead.booking.startsAt).toLocaleString("en-IN")}<br />
                      {lead.booking.showroom} · {lead.booking.demoVehicle}
                    </p>
                  )}
                  {!lead.booking && <p className="mt-2 text-[10px] text-[var(--muted)]">{lead.source}</p>}
                </td>
              </tr>
            ))}
            {visibleLeads.length === 0 && (
              <tr><td colSpan="5" className="px-5 py-12 text-center">
                <p className="text-sm font-medium text-[var(--ink)]">No matching leads</p>
                <p className="mt-2 text-xs text-[var(--muted)]">Try another search or filter.</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[10px] text-[var(--muted)]">
        {isAdmin ? "Admin view includes the unassigned queue." : "Only leads currently assigned to you are displayed."} The five-minute timer measures the response target; it does not dispatch a message.
      </p>
    </>
  );
}
