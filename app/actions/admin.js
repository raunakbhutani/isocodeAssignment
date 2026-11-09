"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const officialStockIds = new Set(["NEW-H-02", "UC-1182", "UC-1190"]);
const idSchema = z.string().min(1).max(64);

const vehicleSchema = z.object({
  stockId: z.string().trim().min(2).max(40),
  type: z.enum(["NEW", "USED"]),
  variantId: idSchema,
  year: z.coerce.number().int().min(1900).max(2100),
  kilometres: z.coerce.number().int().min(0).max(2_000_000),
  priceInr: z.coerce.number().int().min(1).max(2_000_000_000),
  priceType: z.enum(["EX_SHOWROOM", "LISTING_PRICE"]),
  status: z.enum(["AVAILABLE", "BOOKED", "SOLD"]),
  showroomId: idSchema.optional().or(z.literal("")),
});

const vehicleUpdateSchema = vehicleSchema.omit({ stockId: true });

export async function createCarModel(formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    brand: z.string().trim().min(2).max(80),
    name: z.string().trim().min(1).max(100),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid brand and model name." };
  await prisma.carModel.create({ data: parsed.data, select: { id: true } });
  revalidatePath("/admin");
  return { success: "Model added." };
}

export async function createCarVariant(formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    modelId: idSchema,
    name: z.string().trim().min(1).max(100),
    fuel: z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "OTHER"]),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Choose a model and enter a valid variant and fuel type." };
  await prisma.carVariant.create({ data: parsed.data, select: { id: true } });
  revalidatePath("/admin");
  return { success: "Variant added." };
}

export async function createVehicle(formData) {
  await requireRole("ADMIN");
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the vehicle details and price basis." };
  if (officialStockIds.has(parsed.data.stockId)) {
    return { error: "The three official sample records cannot be replaced or edited." };
  }
  if (
    (parsed.data.type === "NEW" && parsed.data.priceType !== "EX_SHOWROOM") ||
    (parsed.data.type === "USED" && parsed.data.priceType !== "LISTING_PRICE")
  ) {
    return { error: "New vehicles require ex-showroom pricing; used vehicles require listing prices." };
  }

  await prisma.vehicleInventory.create({
    data: {
      ...parsed.data,
      showroomId: parsed.data.showroomId || null,
    },
    select: { stockId: true },
  });
  revalidatePath("/admin");
  revalidatePath("/api/vehicles");
  return { success: "Vehicle added to inventory." };
}

export async function updateVehicle(formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    stockId: z.string().trim().min(2).max(40),
    ...vehicleUpdateSchema.shape,
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the vehicle details and price basis." };
  if (officialStockIds.has(parsed.data.stockId)) {
    return { error: "The three official sample records cannot be replaced or edited." };
  }
  if (
    (parsed.data.type === "NEW" && parsed.data.priceType !== "EX_SHOWROOM") ||
    (parsed.data.type === "USED" && parsed.data.priceType !== "LISTING_PRICE")
  ) {
    return { error: "New vehicles require ex-showroom pricing; used vehicles require listing prices." };
  }
  const { stockId, ...data } = parsed.data;
  const updated = await prisma.vehicleInventory.updateMany({
    where: { stockId, isDemo: false },
    data: { ...data, showroomId: data.showroomId || null },
  });
  if (updated.count !== 1) throw new Error("Inventory record not found.");
  revalidatePath("/admin");
  revalidatePath("/api/vehicles");
  return { success: "Vehicle updated." };
}

export async function updateVehicleStatus(formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    stockId: idSchema,
    status: z.enum(["AVAILABLE", "BOOKED", "SOLD"]),
  }).safeParse({
    stockId: formData.get("stockId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Choose an inventory record and valid status." };
  if (officialStockIds.has(parsed.data.stockId)) {
    return { error: "The status of the three official sample records is fixed by the brief." };
  }
  const changed = await prisma.vehicleInventory.updateMany({
    where: { stockId: parsed.data.stockId, isDemo: false },
    data: { status: parsed.data.status },
  });
  if (changed.count !== 1) throw new Error("Inventory record not found.");
  revalidatePath("/admin");
  revalidatePath("/api/vehicles");
  return { success: "Inventory status updated." };
}

export async function saveCityPrice(formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    cityId: idSchema,
    variantId: idSchema,
    roadTaxBasisPoints: z.coerce.number().int().min(0).max(10000),
    registrationFeeInr: z.coerce.number().int().min(0).max(2_000_000_000),
    insuranceInr: z.coerce.number().int().min(0).max(2_000_000_000),
    otherChargesInr: z.coerce.number().int().min(0).max(2_000_000_000),
    effectiveFrom: z.coerce.date(),
    effectiveUntil: z.union([z.coerce.date(), z.literal("")]).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter valid non-negative pricing inputs and an effective date." };
  const { effectiveUntil, ...data } = parsed.data;
  const endDate = effectiveUntil || null;
  if (endDate && endDate <= data.effectiveFrom) {
    return { error: "The end date must be later than the start date." };
  }

  const activePrices = await prisma.cityPrice.findMany({
    where: { cityId: data.cityId, variantId: data.variantId },
    select: { id: true, effectiveFrom: true, effectiveUntil: true },
  });
  const overlaps = activePrices.some((price) => {
    const existingEnd = price.effectiveUntil?.getTime() ?? Number.POSITIVE_INFINITY;
    const newEnd = endDate?.getTime() ?? Number.POSITIVE_INFINITY;
    return data.effectiveFrom.getTime() < existingEnd && newEnd > price.effectiveFrom.getTime();
  });
  if (overlaps) return { error: "Pricing periods for this city and variant cannot overlap." };

  await prisma.cityPrice.create({
    data: { ...data, effectiveUntil: endDate },
    select: { id: true },
  });
  revalidatePath("/admin");
  return { success: "City pricing inputs saved. The on-road total uses these recorded inputs." };
}

export async function createShowroom(formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    name: z.string().trim().min(2).max(100),
    address: z.string().trim().max(300).optional().or(z.literal("")),
    cityId: idSchema,
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a name and select a city." };

  await prisma.showroom.create({
    data: {
      ...parsed.data,
      address: parsed.data.address || null,
      isAssumed: false,
    },
    select: { id: true },
  });
  revalidatePath("/admin");
  revalidatePath("/book-test-drive");
  return { success: "Showroom added." };
}

export async function updateShowroom(formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    showroomId: idSchema,
    name: z.string().trim().min(2).max(100),
    address: z.string().trim().max(300).optional().or(z.literal("")),
    isActive: z.enum(["true", "false"]),
  }).safeParse({
    showroomId: formData.get("showroomId"),
    name: formData.get("name"),
    address: formData.get("address") || "",
    isActive: formData.get("isActive"),
  });
  if (!parsed.success) return { error: "Check the showroom information." };
  const updated = await prisma.showroom.updateMany({
    where: { id: parsed.data.showroomId },
    data: {
      name: parsed.data.name,
      address: parsed.data.address || null,
      isActive: parsed.data.isActive === "true",
    },
  });
  if (updated.count !== 1) throw new Error("Showroom not found.");
  revalidatePath("/admin");
  revalidatePath("/book-test-drive");
  return { success: "Showroom updated." };
}

export async function createConsultant(formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    password: z.string().min(12).max(128).refine((password) => Buffer.byteLength(password, "utf8") <= 72),
    showroomId: idSchema,
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the consultant name, email, password, and showroom." };

  const passwordHash = await hash(parsed.data.password, 12);
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role: "CONSULTANT",
        },
        select: { id: true },
      });
      await tx.consultant.create({
        data: { userId: user.id, showroomId: parsed.data.showroomId },
        select: { id: true },
      });
    });
  } catch (error) {
    if (error?.code === "P2002") return { error: "An account with that email already exists." };
    throw error;
  }
  revalidatePath("/admin");
  return { success: "Consultant account created." };
}

export async function updateConsultant(formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    consultantId: idSchema,
    showroomId: idSchema,
    isActive: z.enum(["true", "false"]),
  }).safeParse({
    consultantId: formData.get("consultantId"),
    showroomId: formData.get("showroomId"),
    isActive: formData.get("isActive"),
  });
  if (!parsed.success) return { error: "Select a valid showroom and consultant status." };
  const updated = await prisma.consultant.updateMany({
    where: { id: parsed.data.consultantId },
    data: {
      showroomId: parsed.data.showroomId,
      isActive: parsed.data.isActive === "true",
    },
  });
  if (updated.count !== 1) throw new Error("Consultant not found.");
  revalidatePath("/admin");
  return { success: "Consultant assignment updated." };
}
