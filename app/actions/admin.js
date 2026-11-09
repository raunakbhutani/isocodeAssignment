"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const idSchema = z.string().min(1).max(64);

async function validateConsultantSetup(showroomId, modelIds) {
  const [showroom, models] = await Promise.all([
    prisma.showroom.findFirst({
      where: { id: showroomId, isActive: true },
      select: { id: true },
    }),
    prisma.carModel.findMany({
      where: { id: { in: modelIds } },
      select: { id: true },
    }),
  ]);
  return Boolean(showroom) && models.length === modelIds.length;
}
const ownerCountSchema = z.preprocess(
  (value) => value === "" || value == null ? null : value,
  z.coerce.number().int().min(0).max(100).nullable(),
);

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
  previousOwners: ownerCountSchema.optional(),
  inspectionReport: z.string().trim().max(5000).optional().or(z.literal("")),
  detailsAreAssumed: z.literal("true").optional(),
});

const vehicleUpdateSchema = vehicleSchema.omit({ stockId: true });

export async function createCarModel(_previousState, formData) {
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

export async function createCarVariant(_previousState, formData) {
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

export async function updateCarModel(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    modelId: idSchema,
    brand: z.string().trim().min(2).max(80),
    name: z.string().trim().min(1).max(100),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid brand and model name." };
  const { modelId, ...data } = parsed.data;
  const updated = await prisma.carModel.updateMany({ where: { id: modelId }, data });
  if (updated.count !== 1) throw new Error("Car model not found.");
  revalidatePath("/admin");
  return { success: "Model updated." };
}

export async function updateCarVariant(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    variantId: idSchema,
    name: z.string().trim().min(1).max(100),
    fuel: z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "OTHER"]),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid variant name and fuel type." };
  const { variantId, ...data } = parsed.data;
  const updated = await prisma.carVariant.updateMany({ where: { id: variantId }, data });
  if (updated.count !== 1) throw new Error("Car variant not found.");
  revalidatePath("/admin");
  revalidatePath("/new-cars");
  revalidatePath("/used-cars");
  return { success: "Variant updated." };
}

export async function createVehicle(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the vehicle details and price basis." };
  if (
    (parsed.data.type === "NEW" && parsed.data.priceType !== "EX_SHOWROOM") ||
    (parsed.data.type === "USED" && parsed.data.priceType !== "LISTING_PRICE") ||
    (parsed.data.stockId === "UC-1190" && parsed.data.status !== "BOOKED")
  ) {
    return { error: parsed.data.stockId === "UC-1190"
      ? "UC-1190 must remain booked."
      : "New vehicles require ex-showroom pricing; used vehicles require listing prices." };
  }

  await prisma.vehicleInventory.create({
    data: {
      ...parsed.data,
      previousOwners: parsed.data.type === "USED" ? parsed.data.previousOwners ?? null : null,
      inspectionReport: parsed.data.type === "USED" ? parsed.data.inspectionReport || null : null,
      detailsAreAssumed: parsed.data.type === "USED" && Boolean(parsed.data.detailsAreAssumed),
      showroomId: parsed.data.showroomId || null,
    },
    select: { stockId: true },
  });
  revalidatePath("/admin");
  revalidatePath("/api/vehicles");
  return { success: "Vehicle added to inventory." };
}

export async function updateVehicle(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    stockId: z.string().trim().min(2).max(40),
    ...vehicleUpdateSchema.shape,
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the vehicle details and price basis." };
  if (
    (parsed.data.type === "NEW" && parsed.data.priceType !== "EX_SHOWROOM") ||
    (parsed.data.type === "USED" && parsed.data.priceType !== "LISTING_PRICE")
  ) {
    return { error: "New vehicles require ex-showroom pricing; used vehicles require listing prices." };
  }
  if (parsed.data.stockId === "UC-1190" && parsed.data.status !== "BOOKED") {
    return { error: "UC-1190 must remain booked." };
  }
  const { stockId, ...data } = parsed.data;
  const updated = await prisma.vehicleInventory.updateMany({
    where: { stockId, isDemo: false },
    data: {
      ...data,
      previousOwners: data.type === "USED" ? data.previousOwners ?? null : null,
      inspectionReport: data.type === "USED" ? data.inspectionReport || null : null,
      detailsAreAssumed: data.type === "USED" && Boolean(data.detailsAreAssumed),
      showroomId: data.showroomId || null,
    },
  });
  if (updated.count !== 1) throw new Error("Inventory record not found.");
  revalidatePath("/admin");
  revalidatePath("/api/vehicles");
  return { success: "Vehicle updated." };
}

export async function updateVehicleStatus(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    stockId: idSchema,
    status: z.enum(["AVAILABLE", "BOOKED", "SOLD"]),
  }).safeParse({
    stockId: formData.get("stockId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Choose an inventory record and valid status." };
  if (parsed.data.stockId === "UC-1190" && parsed.data.status !== "BOOKED") {
    return { error: "UC-1190 must remain booked." };
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

export async function saveCityPrice(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    cityPriceId: idSchema.optional().or(z.literal("")),
    cityId: idSchema,
    variantId: idSchema,
    exShowroomPriceInr: z.coerce.number().int().min(1).max(2_000_000_000),
    roadTaxBasisPoints: z.coerce.number().int().min(0).max(10000),
    registrationFeeInr: z.coerce.number().int().min(0).max(2_000_000_000),
    insuranceInr: z.coerce.number().int().min(0).max(2_000_000_000),
    accessoriesInr: z.coerce.number().int().min(0).max(2_000_000_000),
    otherChargesInr: z.coerce.number().int().min(0).max(2_000_000_000),
    effectiveFrom: z.coerce.date(),
    effectiveUntil: z.union([z.coerce.date(), z.literal("")]).optional(),
    isAssumed: z.literal("true").optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter valid non-negative pricing inputs and an effective date." };
  const { effectiveUntil, cityPriceId, isAssumed, ...data } = parsed.data;
  const endDate = effectiveUntil
    ? new Date(new Date(effectiveUntil).setUTCHours(23, 59, 59, 999))
    : null;
  if (endDate && endDate <= data.effectiveFrom) {
    return { error: "The end date must be later than the start date." };
  }

  const activePrices = await prisma.cityPrice.findMany({
    where: { cityId: data.cityId, variantId: data.variantId },
    select: { id: true, effectiveFrom: true, effectiveUntil: true },
  });
  const overlaps = activePrices.some((price) => {
    if (price.id === cityPriceId) return false;
    const existingEnd = price.effectiveUntil?.getTime() ?? Number.POSITIVE_INFINITY;
    const newEnd = endDate?.getTime() ?? Number.POSITIVE_INFINITY;
    return data.effectiveFrom.getTime() < existingEnd && newEnd > price.effectiveFrom.getTime();
  });
  if (overlaps) return { error: "Pricing periods for this city and variant cannot overlap." };

  if (cityPriceId) {
    const updated = await prisma.cityPrice.updateMany({
      where: { id: cityPriceId },
      data: { ...data, effectiveUntil: endDate, isAssumed: Boolean(isAssumed) },
    });
    if (updated.count !== 1) throw new Error("City pricing record not found.");
  } else {
    await prisma.cityPrice.create({
      data: { ...data, effectiveUntil: endDate, isAssumed: Boolean(isAssumed) },
      select: { id: true },
    });
  }
  revalidatePath("/admin");
  revalidatePath("/api/prices");
  revalidatePath("/cars/NEW-H-02");
  return { success: "City pricing inputs saved." };
}

export async function createCity(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    name: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(100),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid city, state, and country." };

  try {
    await prisma.city.create({ data: parsed.data, select: { id: true } });
  } catch (error) {
    if (error?.code === "P2002") return { error: "That city already exists." };
    throw error;
  }
  revalidatePath("/admin");
  return { success: "City added." };
}

export async function updateCity(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    cityId: idSchema,
    name: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(100),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid city, state, and country." };
  const { cityId, ...data } = parsed.data;

  try {
    const updated = await prisma.city.updateMany({ where: { id: cityId }, data });
    if (updated.count !== 1) throw new Error("City not found.");
  } catch (error) {
    if (error?.code === "P2002") return { error: "That city already exists." };
    throw error;
  }
  revalidatePath("/admin");
  return { success: "City updated." };
}

const vehicleImageUrlSchema = z.string().url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && url.hostname === "images.unsplash.com";
}, "Use a secure images.unsplash.com URL.");

export async function saveVehicleImage(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    imageId: idSchema.optional().or(z.literal("")),
    vehicleStockId: idSchema,
    url: vehicleImageUrlSchema,
    altText: z.string().trim().min(5).max(200),
    sortOrder: z.coerce.number().int().min(0).max(100),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid placeholder image URL, description, and order." };

  const { imageId, ...data } = parsed.data;
  if (imageId) {
    const updated = await prisma.vehicleImage.updateMany({
      where: { id: imageId, vehicleStockId: data.vehicleStockId },
      data: { ...data, isAssumed: true },
    });
    if (updated.count !== 1) throw new Error("Vehicle image not found.");
  } else {
    await prisma.vehicleImage.create({
      data: { ...data, isAssumed: true },
      select: { id: true },
    });
  }
  revalidatePath("/admin");
  revalidatePath(`/cars/${data.vehicleStockId}`);
  return { success: "Vehicle image saved as assumed placeholder photography." };
}

export async function deleteVehicleImage(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    imageId: idSchema,
    vehicleStockId: idSchema,
  }).safeParse({
    imageId: formData.get("imageId"),
    vehicleStockId: formData.get("vehicleStockId"),
  });
  if (!parsed.success) return { error: "Invalid image reference." };
  const deleted = await prisma.vehicleImage.deleteMany({
    where: { id: parsed.data.imageId, vehicleStockId: parsed.data.vehicleStockId },
  });
  if (deleted.count !== 1) throw new Error("Vehicle image not found.");
  revalidatePath("/admin");
  revalidatePath(`/cars/${parsed.data.vehicleStockId}`);
  return { success: "Vehicle image removed." };
}

export async function createShowroom(_previousState, formData) {
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

export async function updateShowroom(_previousState, formData) {
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

export async function createConsultant(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    password: z.string().min(12).max(128).refine((password) => Buffer.byteLength(password, "utf8") <= 72),
    showroomId: idSchema,
    modelIds: z.array(idSchema).max(100).refine((ids) => new Set(ids).size === ids.length),
  }).safeParse({
    ...Object.fromEntries(formData),
    modelIds: formData.getAll("modelIds"),
  });
  if (!parsed.success) return { error: "Check the consultant name, email, password, and showroom." };
  if (!await validateConsultantSetup(parsed.data.showroomId, parsed.data.modelIds)) {
    return { error: "Choose an active showroom and valid model specialties." };
  }

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
        data: {
          userId: user.id,
          showroomId: parsed.data.showroomId,
          models: { create: parsed.data.modelIds.map((modelId) => ({ modelId })) },
        },
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

export async function updateConsultant(_previousState, formData) {
  await requireRole("ADMIN");
  const parsed = z.object({
    consultantId: idSchema,
    showroomId: idSchema,
    isActive: z.enum(["true", "false"]),
    modelIds: z.array(idSchema).max(100).refine((ids) => new Set(ids).size === ids.length),
  }).safeParse({
    consultantId: formData.get("consultantId"),
    showroomId: formData.get("showroomId"),
    isActive: formData.get("isActive"),
    modelIds: formData.getAll("modelIds"),
  });
  if (!parsed.success) return { error: "Select a valid showroom and consultant status." };
  if (!await validateConsultantSetup(parsed.data.showroomId, parsed.data.modelIds)) {
    return { error: "Choose an active showroom and valid model specialties." };
  }
  await prisma.$transaction(async (tx) => {
    const updated = await tx.consultant.updateMany({
      where: { id: parsed.data.consultantId },
      data: {
        showroomId: parsed.data.showroomId,
        isActive: parsed.data.isActive === "true",
      },
    });
    if (updated.count !== 1) throw new Error("Consultant not found.");
    await tx.consultantModel.deleteMany({ where: { consultantId: parsed.data.consultantId } });
    if (parsed.data.modelIds.length) {
      await tx.consultantModel.createMany({
        data: parsed.data.modelIds.map((modelId) => ({
          consultantId: parsed.data.consultantId,
          modelId,
        })),
      });
    }
  });
  revalidatePath("/admin");
  return { success: "Consultant assignment updated." };
}
