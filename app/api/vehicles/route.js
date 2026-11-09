import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();
  const vehicles = await prisma.vehicleInventory.findMany({
    where: { isDemo: false },
    select: {
      stockId: true,
      type: true,
      year: true,
      kilometres: true,
      priceInr: true,
      priceType: true,
      status: true,
      variant: {
        select: {
          name: true,
          fuel: true,
          model: { select: { brand: true, name: true } },
        },
      },
    },
    orderBy: [{ type: "asc" }, { stockId: "asc" }],
  });
  return NextResponse.json({ vehicles });
}
