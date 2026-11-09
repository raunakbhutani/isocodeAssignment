import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateOnRoadPrice } from "@/lib/pricing";

export async function GET(request) {
  await connection();
  const url = new URL(request.url);
  const cityId = url.searchParams.get("cityId");
  const variantId = url.searchParams.get("variantId");
  if (!cityId || !variantId) {
    return NextResponse.json({ error: "cityId and variantId are required." }, { status: 400 });
  }

  const now = new Date();
  const [inventory, cityPrice] = await Promise.all([
    prisma.vehicleInventory.findFirst({
      where: {
        variantId,
        type: "NEW",
        priceType: "EX_SHOWROOM",
        priceInr: { not: null },
        isDemo: false,
      },
      select: { priceInr: true },
      orderBy: { stockId: "asc" },
    }),
    prisma.cityPrice.findFirst({
      where: {
        cityId,
        variantId,
        effectiveFrom: { lte: now },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
      },
      orderBy: { effectiveFrom: "desc" },
      select: {
        roadTaxBasisPoints: true,
        registrationFeeInr: true,
        insuranceInr: true,
        otherChargesInr: true,
        effectiveFrom: true,
        effectiveUntil: true,
      },
    }),
  ]);
  if (!inventory || !cityPrice) {
    return NextResponse.json(
      { error: "Approved ex-showroom price and current city pricing inputs are required." },
      { status: 404 },
    );
  }

  const breakdown = calculateOnRoadPrice(inventory.priceInr, cityPrice);
  return NextResponse.json({
    cityId,
    variantId,
    effectiveFrom: cityPrice.effectiveFrom,
    effectiveUntil: cityPrice.effectiveUntil,
    breakdown,
  });
}
