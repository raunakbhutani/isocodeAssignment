import "server-only";
import { randomUUID } from "node:crypto";

export async function createAssignedLead(tx, input) {
  const showroom = input.showroomId
    ? await tx.showroom.findFirst({
        where: { id: input.showroomId, isActive: true },
        select: { id: true, cityId: true },
      })
    : null;
  if (input.showroomId && !showroom) throw new Error("The selected showroom is not available.");

  const vehicle = input.vehicleStockId
    ? await tx.vehicleInventory.findUnique({
        where: { stockId: input.vehicleStockId },
        select: { stockId: true, variantId: true },
      })
    : null;
  if (input.vehicleStockId && !vehicle) throw new Error("The selected vehicle was not found.");

  const consultants = await tx.consultant.findMany({
    where: {
      isActive: true,
      ...(showroom ? { showroomId: showroom.id } : {}),
    },
    select: {
      id: true,
      _count: { select: { leads: true } },
    },
    orderBy: { id: "asc" },
  });
  if (consultants.length === 0) {
    throw new Error("No active consultant is available for this showroom.");
  }
  consultants.sort((first, second) => first._count.leads - second._count.leads);
  const assignedConsultant = consultants[0];

  const lead = await tx.lead.create({
    data: {
      reference: `L-${randomUUID()}`,
      buyerUserId: input.buyerUserId ?? null,
      customerName: input.customerName,
      email: input.email || null,
      phone: input.phone,
      message: input.message || null,
      source: input.source,
      variantId: vehicle?.variantId,
      vehicleStockId: vehicle?.stockId,
      cityId: showroom?.cityId,
      requestedShowroomId: showroom?.id,
      assignedConsultantId: assignedConsultant.id,
      assignedAt: new Date(),
      assignments: {
        create: { consultantId: assignedConsultant.id },
      },
      consentRecords: {
        create: [
          { type: "CONTACT", granted: true, source: input.source },
          {
            type: "MARKETING",
            granted: Boolean(input.marketingConsent),
            source: input.source,
          },
        ],
      },
    },
    select: { id: true, reference: true },
  });
  return lead;
}
