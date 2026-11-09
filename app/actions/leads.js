"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { leadInputSchema } from "@/lib/validation";
import { createAssignedLead } from "@/lib/lead-service";
import { isBookableDemoSlot } from "@/lib/test-drive";

function parseLeadForm(formData) {
  return leadInputSchema.safeParse({
    customerName: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone"),
    message: formData.get("message") || "",
    vehicleStockId: formData.get("vehicleStockId") || "",
    showroomId: formData.get("showroomId") || "",
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
  const lead = await prisma.$transaction((tx) =>
    createAssignedLead(tx, {
      ...parsed.data,
      buyerUserId: user?.id,
      source: "WEBSITE",
    }),
  );
  revalidatePath("/consultant/leads");
  return { success: `Enquiry received. Reference: ${lead.reference}` };
}

const bookingSchema = leadInputSchema.extend({
  vehicleStockId: z.string().min(1).max(40),
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
    slotId: formData.get("slotId") || "",
    contactConsent: formData.get("contactConsent") === "on",
    marketingConsent: formData.get("marketingConsent") === "on",
  });
  if (!parsed.success) return { error: "Check your details, showroom, time slot, and contact consent." };

  const user = await getCurrentUser();
  if (user && user.role !== "BUYER") {
    return { error: "Only buyer accounts can request a test drive." };
  }

  const result = await prisma.$transaction(async (tx) => {
    const slot = await tx.testDriveSlot.findUnique({
      where: { id: parsed.data.slotId },
      include: { showroom: true, demoVehicle: true },
    });
    if (!isBookableDemoSlot(slot, parsed.data.showroomId, parsed.data.vehicleStockId)) {
      throw new Error("That test-drive slot is unavailable.");
    }

    const reserved = await tx.testDriveSlot.updateMany({
      where: { id: slot.id, isOpen: true },
      data: { isOpen: false },
    });
    if (reserved.count !== 1) throw new Error("That test-drive slot was just booked.");

    const lead = await createAssignedLead(tx, {
      ...parsed.data,
      buyerUserId: user?.id,
      source: "TEST_DRIVE",
    });
    await tx.testDriveBooking.create({
      data: {
        leadId: lead.id,
        slotId: slot.id,
        buyerUserId: user?.id,
      },
      select: { id: true },
    });
    return lead;
  });

  revalidatePath("/book-test-drive");
  revalidatePath("/consultant/leads");
  return { success: `Request received. Reference: ${result.reference}` };
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
