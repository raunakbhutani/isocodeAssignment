import { connection } from "next/server";
import StaffLayout from "../../components/staff-layout";
import AdminTabs from "../../components/admin-tabs";
import { requirePageRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin dashboard | DriveHub" };

export default async function AdminPage() {
  await requirePageRole("ADMIN");
  await connection();

  const [inventory, models, allVariants, newVariants, cities, prices, showrooms, consultants] = await Promise.all([
    prisma.vehicleInventory.findMany({
      where: { isDemo: false },
      include: {
        variant: { include: { model: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ type: "asc" }, { stockId: "asc" }],
    }),
    prisma.carModel.findMany({
      include: { variants: { include: { _count: { select: { inventory: true } } } } },
      orderBy: [{ brand: "asc" }, { name: "asc" }],
    }),
    prisma.carVariant.findMany({
      include: { model: true, _count: { select: { inventory: true } } },
      orderBy: [{ model: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.carVariant.findMany({
      where: { inventory: { some: { type: "NEW", isDemo: false } } },
      include: { model: true, _count: { select: { inventory: true } } },
      orderBy: [{ model: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.city.findMany({ orderBy: [{ name: "asc" }, { state: "asc" }] }),
    prisma.cityPrice.findMany({
      include: { city: true, variant: { include: { model: true } } },
      orderBy: [{ city: { name: "asc" } }, { effectiveFrom: "desc" }],
    }),
    prisma.showroom.findMany({
      include: { city: { select: { name: true } } },
      orderBy: [{ city: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.consultant.findMany({
      include: {
        user: { select: { name: true, email: true } },
        showroom: { select: { name: true } },
        models: { include: { model: true } },
      },
      orderBy: [{ showroom: { name: "asc" } }, { user: { name: "asc" } }],
    }),
  ]);
  const saleInventory = inventory.filter((vehicle) => !vehicle.isDemo);

  return (
    <StaffLayout title="Admin dashboard" description="Manage vehicle stock, models, images, and city-specific pricing.">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Inventory records", saleInventory.length, "Database inventory, excluding demo cars"],
          ["Available vehicles", saleInventory.filter((vehicle) => vehicle.status === "AVAILABLE").length, "Current availability"],
          ["City price records", prices.length, "Assumptions are visibly flagged"],
        ].map(([label, value, note]) => (
          <div key={label} className="border border-[var(--line)] bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{label}</p>
            <p className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">{value}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
          </div>
        ))}
      </div>
      <AdminTabs
        inventory={saleInventory}
        models={models}
        variants={allVariants}
        newVariants={newVariants}
        cities={cities}
        prices={prices}
        showrooms={showrooms}
        consultants={consultants}
      />
    </StaffLayout>
  );
}
