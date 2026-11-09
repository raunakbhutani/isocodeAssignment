"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "./ui/primitives";

const statuses = ["All leads", "New", "Contacted"];

export default function LeadTable({ leads }) {
  // Search and status controls filter only clearly labeled fictional sample leads.
  const [status, setStatus] = useState("All leads");
  const [query, setQuery] = useState("");

  const visibleLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const matchesStatus = status === "All leads" || lead.status === status;
        const matchesQuery = `${lead.name} ${lead.vehicleStockId} ${lead.id}`.toLowerCase().includes(query.toLowerCase());
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
          placeholder="Search buyer, stock ID, or lead ID"
          className="h-11 min-w-0 flex-1 border border-[var(--line)] bg-white px-4 text-sm outline-none focus:border-[var(--accent)]"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              aria-pressed={status === item}
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
        <div className="hidden grid-cols-[1.3fr_0.85fr_0.8fr_0.8fr_1fr] gap-4 border-b border-[var(--line)] bg-[#fbfbfa] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] lg:grid">
          <span>Buyer</span><span>Interested stock</span><span>Source</span><span>Status</span><span>Response timer</span>
        </div>
        {visibleLeads.map((lead) => (
          <Link
            key={lead.id}
            href={`/consultant/leads/${lead.id}`}
            className="grid gap-3 border-b border-[var(--line)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[#fcfcfb] lg:grid-cols-[1.3fr_0.85fr_0.8fr_0.8fr_1fr] lg:items-center lg:gap-4"
          >
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">{lead.name}</p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">{lead.id} · Assigned: {lead.assignedTo}</p>
            </div>
            <p className="text-xs text-[var(--ink)]">{lead.vehicleStockId}</p>
            <p className="text-xs text-[var(--muted)]">{lead.source}</p>
            <Badge tone={lead.status === "New" ? "accent" : "neutral"}>{lead.status}</Badge>
            <p className="text-xs text-[var(--muted)]">{lead.responseTimer}</p>
          </Link>
        ))}
        {visibleLeads.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-[var(--ink)]">No matching leads</p>
            <p className="mt-2 text-xs text-[var(--muted)]">Try another search or status filter.</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-[10px] text-[var(--muted)]">Demo records only. Live assignment and response timers are not connected.</p>
    </>
  );
}
