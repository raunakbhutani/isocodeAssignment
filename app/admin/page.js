import StaffLayout from "../../components/staff-layout";
import AdminTabs from "../../components/admin-tabs";
import { consultants, showrooms, vehicles } from "../../lib/mock-data";

export const metadata = { title: "Admin dashboard | DriveHub" };

export default function AdminPage() {
  return (
    <StaffLayout title="Admin dashboard" description="Review the supplied inventory and planned model, pricing, showroom, and consultant management areas.">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Official stock records", vehicles.length, "Supplied in the project brief"],
          ["Available records", vehicles.filter((vehicle) => vehicle.status === "AVAILABLE").length, "Status from supplied brief"],
          ["Booked records", vehicles.filter((vehicle) => vehicle.status === "BOOKED").length, "Not available for test-drive"],
        ].map(([label, value, note]) => (
          <div key={label} className="border border-[var(--line)] bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{label}</p>
            <p className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">{value}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
          </div>
        ))}
      </div>
      <AdminTabs showrooms={showrooms} consultants={consultants} />
    </StaffLayout>
  );
}
