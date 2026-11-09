import StaffLayout from "../../components/staff-layout";
import AdminTabs from "../../components/admin-tabs";
import { mockPricing, vehicles } from "../../lib/mock-data";

export const metadata = { title: "Admin workspace | Company A" };

export default function AdminPage() {
  return (
    <StaffLayout title="Inventory & pricing" description="Review sample vehicle availability and list prices in one place.">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Official stock records", vehicles.length, "Supplied in the project brief"],
          ["Available records", vehicles.filter((vehicle) => vehicle.status === "AVAILABLE").length, "Status from supplied brief"],
          ["Booked records", vehicles.filter((vehicle) => vehicle.status === "BOOKED").length, "Not available for booking"],
        ].map(([label, value, note]) => (
          <div key={label} className="border border-[var(--line)] bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{label}</p>
            <p className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">{value}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
          </div>
        ))}
      </div>
      <AdminTabs vehicles={vehicles} pricing={mockPricing} />
    </StaffLayout>
  );
}
