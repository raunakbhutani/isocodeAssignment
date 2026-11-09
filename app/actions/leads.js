"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { leadInputSchema } from "@/lib/validation";
import { createAssignedLead, withSerializableTransaction } from "@/lib/lead-service";
import { BookingConflictError, isBookableDemoSlot } from "@/lib/test-drive";

function parseLeadForm(formData) {
  return leadInputSchema.safeParse({
    customerName: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone"),
    message: formData.get("message") || "",
    vehicleStockId: formData.get("vehicleStockId") || "",
    showroomId: formData.get("showroomId") || "",
    budgetInr: formData.get("budgetInr") || "",
    purchaseTimeline: formData.get("purchaseTimeline") || "",
    contactConsent: formData.get("contactConsent") === "on",
    marketingConsent: formData.get("marketingConsent") === "on",
  });
}

export async function submitEnquiry(_previousState, formData) {
  const parsed = parseLeadForm(formData);
  if (!parsed.success) return { error: "Check your details and confirm that Company A may contact you." };

  const user = await getCurrentUser();
  if (user && user.role !== "BUYER") {
    return { error: "Only buyer accounts can submit a customer enquiry." };
  }
  const lead = await withSerializableTransaction(prisma, (tx) =>
    createAssignedLead(tx, {
      ...parsed.data,
      buyerUserId: user?.id,
      source: "WEBSITE",
    }),
  );
  revalidatePath("/consultant/leads");
  return {
    success: lead.assignedConsultant
      ? `Enquiry received and assigned to ${lead.assignedConsultant.user.name}. Reference: ${lead.reference}`
      : `Enquiry received and placed in the admin assignment queue. Reference: ${lead.reference}`,
  };
}

const bookingSchema = leadInputSchema.extend({
  vehicleStockId: z.string().min(1).max(40),
  demoVehicleStockId: z.string().min(1).max(40),
  showroomId: z.string().min(1).max(64),
  slotId: z.string().min(1).max(64),
});

export async function requestTestDrive(_previousState, formData) {
  const parsed = bookingSchema.safeParse({
    customerName: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone"),
    message: formData.get("message") || "",
    vehicleStockId: formData.get("vehicleStockId") || "",
    showroomId: formData.get("showroomId") || "",
    demoVehicleStockId: formData.get("demoVehicleStockId") || "",
    slotId: formData.get("slotId") || "",
    budgetInr: formData.get("budgetInr") || "",
    purchaseTimeline: formData.get("purchaseTimeline") || "",
    contactConsent: formData.get("contactConsent") === "on",
    marketingConsent: formData.get("marketingConsent") === "on",
  });
  if (!parsed.success) return { error: "Check your details, showroom, time slot, and contact consent." };

  const user = await getCurrentUser();
  if (user && user.role !== "BUYER") {
    return { error: "Only buyer accounts can request a test drive." };
  }

  const result = await withSerializableTransaction(prisma, async (tx) => {
    const now = new Date();
    const interestedVehicle = await tx.vehicleInventory.findFirst({
      where: {
        stockId: parsed.data.vehicleStockId,
        isDemo: false,
        status: "AVAILABLE",
      },
      select: {
        stockId: true,
        variant: { select: { name: true, model: { select: { name: true } } } },
      },
    });
    if (!interestedVehicle) {
      throw new BookingConflictError("The selected vehicle is not available for a test-drive enquiry.");
    }
    const slot = await tx.testDriveSlot.findUnique({
      where: { id: parsed.data.slotId },
      include: {
        showroom: true,
        demoVehicle: {
          include: { variant: { include: { model: true } } },
        },
      },
    });
    if (!isBookableDemoSlot(
      slot,
      parsed.data.showroomId,
      parsed.data.demoVehicleStockId,
      now,
    )) {
      throw new BookingConflictError("That test-drive slot is unavailable.");
    }

    const reserved = await tx.testDriveSlot.updateMany({
      where: { id: slot.id, isOpen: true, startsAt: { gt: now } },
      data: { isOpen: false },
    });
    if (reserved.count !== 1) throw new BookingConflictError("That test-drive slot was just booked.");

    const lead = await createAssignedLead(tx, {
      ...parsed.data,
      buyerUserId: user?.id,
      source: "TEST_DRIVE",
      status: "TEST_DRIVE_SCHEDULED",
    });
    await tx.testDriveBooking.create({
      data: {
        leadId: lead.id,
        slotId: slot.id,
        buyerUserId: user?.id,
        status: "CONFIRMED",
      },
      select: { id: true },
    });
    return {
      ...lead,
      startsAt: slot.startsAt.toISOString(),
      showroomName: slot.showroom.name,
      demoVehicleName: `${slot.demoVehicle.variant.model.name} ${slot.demoVehicle.variant.name}`,
      interestedVehicle: `${interestedVehicle.variant.model.name} ${interestedVehicle.variant.name}`,
    };
  }).catch((error) => {
    if (error instanceof BookingConflictError) return { error: error.message };
    if (error?.code === "P2002") return { error: "That test-drive slot was just booked." };
    throw error;
  });
  if (result.error) return result;

  revalidatePath("/book-test-drive");
  revalidatePath("/consultant/leads");
  return {
    success: result.assignedConsultant
      ? `Test drive confirmed and assigned to ${result.assignedConsultant.user.name}.`
      : "Test drive confirmed. The request is in the admin assignment queue.",
    confirmation: {
      reference: result.reference,
      startsAt: result.startsAt,
      showroomName: result.showroomName,
      demoVehicleName: result.demoVehicleName,
      interestedVehicle: result.interestedVehicle,
    },
  };
}

export async function setBuyerConsent(_previousState, formData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "BUYER") {
    throw new Error("Sign in with a buyer account to manage communication consent.");
  }
  const value = formData.get("marketingConsent");
  if (value !== "true" && value !== "false") {
    return { error: "Choose whether to allow marketing messages." };
  }
  await prisma.consentRecord.create({
    data: {
      userId: user.id,
      type: "MARKETING",
      granted: value === "true",
      source: "BUYER_SETTINGS",
    },
    select: { id: true },
  });
  revalidatePath("/account/consent");
  return { success: "Your communication preference has been saved." };
}
