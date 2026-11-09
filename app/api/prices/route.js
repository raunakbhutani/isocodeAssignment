import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateOnRoadPrice, selectCityPrice } from "@/lib/pricing";

export async function GET(request) {
  await connection();
  const url = new URL(request.url);
  const cityId = url.searchParams.get("cityId");
  const variantId = url.searchParams.get("variantId");
  if (!cityId || !variantId) {
    return NextResponse.json({ error: "cityId and variantId are required." }, { status: 400 });
  }

  const now = new Date();
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    select: { id: true },
  });
  if (!city) return NextResponse.json({ error: "City not found." }, { status: 404 });

  const records = await prisma.cityPrice.findMany({
    where: { cityId, variantId },
    orderBy: { effectiveFrom: "desc" },
  });
  const cityPrice = selectCityPrice(records, cityId, variantId, now);
  if (!cityPrice) {
    return NextResponse.json(
      { error: "No valid city price is available for this vehicle and date." },
      { status: 404 },
    );
  }

  let breakdown;
  try {
    breakdown = calculateOnRoadPrice(cityPrice, now);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }
  return NextResponse.json({
    cityId,
    variantId,
    effectiveFrom: cityPrice.effectiveFrom,
    effectiveUntil: cityPrice.effectiveUntil,
    isAssumed: cityPrice.isAssumed,
    breakdown,
  });
}
