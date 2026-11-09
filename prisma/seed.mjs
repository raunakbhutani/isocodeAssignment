import { PrismaClient } from "@prisma/client";
import { officialInventory } from "./seed-data.mjs";

const prisma = new PrismaClient();

async function seedOfficialInventory() {
  await prisma.city.upsert({
    where: {
      name_state_country: {
        name: "Lucknow",
        state: "Uttar Pradesh",
        country: "India",
      },
    },
    update: {},
    create: {
      name: "Lucknow",
      state: "Uttar Pradesh",
      country: "India",
    },
  });

  for (const record of officialInventory) {
    const model = await prisma.vehicleModel.upsert({
      where: {
        brand_name: {
          brand: "Brand X",
          name: record.model,
        },
      },
      update: {},
      create: {
        brand: "Brand X",
        name: record.model,
      },
    });

    const variant = await prisma.variant.upsert({
      where: {
        modelId_name: {
          modelId: model.id,
          name: record.variant,
        },
      },
      update: { fuel: record.fuel },
      create: {
        modelId: model.id,
        name: record.variant,
        fuel: record.fuel,
      },
    });

    const stockFields = {
      type: record.type,
      variantId: variant.id,
      year: record.year,
      kilometres: record.kilometres,
      priceInr: record.priceInr,
      priceBasis: record.priceBasis,
      status: record.status,
    };

    await prisma.vehicleStock.upsert({
      where: { stockId: record.stockId },
      update: stockFields,
      create: {
        stockId: record.stockId,
        ...stockFields,
      },
    });
  }
}

try {
  await seedOfficialInventory();
  console.info("Seeded the three official Company A inventory records.");
} catch (error) {
  console.error("Failed to seed official inventory.", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
