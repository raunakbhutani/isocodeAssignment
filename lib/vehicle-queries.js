import "server-only";
import { prisma } from "@/lib/prisma";

const placeholderPhotos = [
  "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",
];

export async function listPublicVehicles(type) {
  const records = await prisma.vehicleInventory.findMany({
    where: { type, isDemo: false },
    include: {
      variant: { include: { model: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: [{ status: "asc" }, { stockId: "asc" }],
  });
  return records.map(toPublicVehicle);
}

export async function getPublicVehicle(stockId) {
  const record = await prisma.vehicleInventory.findFirst({
    where: { stockId, isDemo: false },
    include: {
      variant: { include: { model: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  return record ? toPublicVehicle(record) : null;
}

function toPublicVehicle(record) {
  const firstImage = record.images[0];
  const placeholderPhoto = placeholderPhotos[
    Math.abs([...record.stockId].reduce((sum, character) => sum + character.charCodeAt(0), 0)) %
    placeholderPhotos.length
  ];
  return {
    stockId: record.stockId,
    slug: record.stockId,
    type: record.type,
    model: record.variant.model.name,
    variant: record.variant.name,
    fuel: record.variant.fuel,
    year: record.year,
    kilometres: record.kilometres,
    priceInr: record.priceInr,
    priceBasis: record.priceType === "EX_SHOWROOM" ? "EX_SHOWROOM" : "LISTING",
    status: record.status,
    previousOwners: record.previousOwners,
    inspectionReport: record.inspectionReport,
    detailsAreAssumed: record.detailsAreAssumed,
    image: firstImage?.url ?? placeholderPhoto,
    imageAlt: firstImage?.altText ?? `Placeholder photo only; not stock unit ${record.stockId}`,
    imageIsAssumed: firstImage ? firstImage.isAssumed : true,
    images: record.images.map((image) => ({
      id: image.id,
      url: image.url,
      altText: image.altText,
      isAssumed: image.isAssumed,
    })),
    variantId: record.variantId,
  };
}
