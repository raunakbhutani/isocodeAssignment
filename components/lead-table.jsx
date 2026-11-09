"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const statuses = ["All leads", "New", "Contacted"];

export default function LeadTable({ leads }) {
  // These controls filter the example leads in memory and do not update a server.
  const [status, setStatus] = useState("All leads");
  const [query, setQuery] = useState("");

  const visibleLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const matchesStatus = status === "All leads" || lead.status === status;
        const matchesQuery = `${lead.name} ${lead.vehicle} ${lead.id}`.toLowerCase().includes(query.toLowerCase());
        return matchesStatus && matchesQuery;
      }),
    [leads, query, status],
  );

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="lead-search">Search leads</label>
        <input
          id="lead-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, vehicle or lead ID"
          className="h-11 min-w-0 flex-1 border border-[var(--line)] bg-white px-4 text-sm outline-none focus:border-[var(--accent)]"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={`whitespace-nowrap border px-4 text-xs transition-colors ${
                status === item ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white text-[var(--muted)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden border border-[var(--line)] bg-white">
        <div className="hidden grid-cols-[1.3fr_1fr_1fr_0.8fr_0.8fr] gap-4 border-b border-[var(--line)] bg-[#fbfbfa] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)] md:grid">
          <span>Customer</span><span>Vehicle</span><span>Source</span><span>Status</span><span>Received</span>
        </div>
        {visibleLeads.map((lead) => (
          <Link
            key={lead.id}
            href={`/consultant/leads/${lead.id}`}
            className="grid gap-3 border-b border-[var(--line)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[#fcfcfb] md:grid-cols-[1.3fr_1fr_1fr_0.8fr_0.8fr] md:items-center md:gap-4"
          >
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">{lead.name}</p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">{lead.id} · {lead.owner}</p>
            </div>
            <p className="text-xs text-[var(--ink)]">{lead.vehicle}</p>
            <p className="text-xs text-[var(--muted)]">{lead.source}</p>
            <span className={`w-fit px-2.5 py-1 text-[10px] font-medium ${
              lead.status === "New" ? "bg-blue-50 text-blue-800" : lead.status === "Qualified" ? "bg-green-50 text-green-800" : "bg-stone-100 text-stone-700"
            }`}>
              {lead.status}
            </span>
            <p className="text-xs text-[var(--muted)]">{lead.date}</p>
          </Link>
        ))}
        {visibleLeads.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-[var(--muted)]">No leads match this view.</p>
        )}
      </div>
    </>
  );
}
