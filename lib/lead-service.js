import "server-only";
import { randomUUID } from "node:crypto";
import { selectRoundRobinConsultant } from "@/lib/lead-assignment";

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
        select: { stockId: true, isDemo: true, variantId: true, variant: { select: { modelId: true } } },
      })
    : null;
  if (input.vehicleStockId && !vehicle) throw new Error("The selected vehicle was not found.");
  if (vehicle?.isDemo) throw new Error("Demo cars can only be selected as test-drive vehicles.");

  const variant = input.variantId
    ? await tx.carVariant.findUnique({
        where: { id: input.variantId },
        select: { id: true, modelId: true },
      })
    : null;
  if (input.variantId && !variant) throw new Error("The selected vehicle variant was not found.");
  if (vehicle && variant && vehicle.variantId !== variant.id) {
    throw new Error("The selected vehicle and variant do not match.");
  }
  const variantId = variant?.id ?? vehicle?.variantId ?? null;
  const modelId = variant?.modelId ?? vehicle?.variant.modelId ?? null;

  const consultants = showroom && modelId
    ? await tx.consultant.findMany({
    where: {
      isActive: true,
      showroomId: showroom.id,
      models: { some: { modelId } },
    },
    select: { id: true },
    orderBy: { id: "asc" },
  })
    : [];
  let assignedConsultant = null;
  if (consultants.length) {
    await tx.leadAssignmentCursor.createMany({
      data: [{ showroomId: showroom.id, modelId }],
      skipDuplicates: true,
    });
    const cursor = await tx.leadAssignmentCursor.update({
      where: { showroomId_modelId: { showroomId: showroom.id, modelId } },
      data: { nextIndex: { increment: 1 } },
      select: { nextIndex: true },
    });
    assignedConsultant = selectRoundRobinConsultant(consultants, cursor.nextIndex);
  }

  const lead = await tx.lead.create({
    data: {
      reference: `L-${randomUUID()}`,
      buyerUserId: input.buyerUserId ?? null,
      customerName: input.customerName,
      email: input.email || null,
      phone: input.phone,
      message: input.message || null,
      budgetInr: input.budgetInr ?? null,
      purchaseTimeline: input.purchaseTimeline || null,
      source: input.source,
      status: input.status ?? "NEW",
      variantId,
      vehicleStockId: vehicle?.stockId,
      cityId: showroom?.cityId,
      requestedShowroomId: showroom?.id,
      assignedConsultantId: assignedConsultant?.id ?? null,
      assignedAt: assignedConsultant ? new Date() : null,
      ...(assignedConsultant ? {
        assignments: {
          create: {
            consultantId: assignedConsultant.id,
            showroomId: showroom.id,
            modelId,
          },
        },
      } : {}),
      notifications: {
        create: {
          recipientConsultantId: assignedConsultant?.id ?? null,
          type: assignedConsultant ? "LEAD_ASSIGNED" : "LEAD_UNASSIGNED",
          message: assignedConsultant
            ? `Lead ${input.customerName} assigned to consultant. Internal notification only; no external message was sent.`
            : `Lead ${input.customerName} needs admin assignment; no eligible consultant matched the selected showroom and model.`,
        },
      },
      ...(assignedConsultant ? {
        activities: {
          create: {
            type: "SYSTEM",
            details: "Lead assigned automatically using the showroom/model round-robin queue. Internal acknowledgement recorded; no external message was sent.",
          },
        },
      } : {}),
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
    select: {
      id: true,
      reference: true,
      assignedConsultant: {
        select: { user: { select: { name: true } } },
      },
    },
  });
  return lead;
}

export async function withSerializableTransaction(prisma, callback) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(callback, { isolationLevel: "Serializable" });
    } catch (error) {
      if (error?.code !== "P2034" || attempt === 2) throw error;
    }
  }
  throw new Error("Could not complete the lead transaction.");
}
