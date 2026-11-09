"use client";

import { useState } from "react";
import { formatPrice } from "../lib/format";

export default function AdminTabs({ vehicles, pricing }) {
  // The tabs only switch between sample tables; nothing is edited or persisted.
  const [activeTab, setActiveTab] = useState("cars");

  const headings = activeTab === "cars"
    ? ["Stock ID", "Model / variant", "Year / km", "Status"]
    : ["Model / variant", "Variant", "Price", "Price basis / status"];

  return (
    <section className="border border-[var(--line)] bg-white">
      <div className="flex border-b border-[var(--line)] px-4 sm:px-6" role="tablist" aria-label="Admin data">
        {[
          { key: "cars", label: "Cars" },
          { key: "pricing", label: "Pricing" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-5 text-sm ${activeTab === tab.key ? "font-medium text-[var(--ink)]" : "text-[var(--muted)]"}`}
          >
            {tab.label}
            {activeTab === tab.key && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-[var(--accent)]" />}
          </button>
        ))}
        <span className="ml-auto self-center text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">Brief records · read only</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[#fbfbfa]">
              {headings.map((heading) => <th key={heading} className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">{heading}</th>)}
            </tr>
          </thead>
          <tbody>
            {(activeTab === "cars" ? vehicles : pricing).map((row, index) => (
              <tr key={`${row.model}-${index}`} className="border-b border-[var(--line)] last:border-0">
                {activeTab === "cars" ? (
                  <>
                    <td className="px-6 py-4 text-sm font-medium text-[var(--ink)]">{row.stockId}</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted)]">{row.model} {row.variant}</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted)]">{row.year} / {row.kilometres.toLocaleString("en-IN")} km</td>
                    <td className="px-6 py-4 text-xs text-[var(--muted)]">{row.status}</td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm font-medium text-[var(--ink)]">{row.model}</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted)]">{row.trim}</td>
                    <td className="px-6 py-4 text-sm text-[var(--ink)]">{formatPrice(row.price)}</td>
                    <td className="px-6 py-4 text-xs text-[var(--muted)]">{row.priceBasis} / {row.availability}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-[var(--line)] px-6 py-4 text-xs text-[var(--muted)]">
        This preview is read-only. Add, edit, and save actions will be connected when backend services are implemented.
      </p>
    </section>
  );
}
