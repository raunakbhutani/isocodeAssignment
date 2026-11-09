import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { officialInventory } from "./seed-data.mjs";

const prisma = new PrismaClient();
const demoPassword = process.env.DEMO_ACCOUNT_PASSWORD;

if (
  !demoPassword ||
  demoPassword.length < 12 ||
  Buffer.byteLength(demoPassword, "utf8") > 72
) {
  throw new Error("Set DEMO_ACCOUNT_PASSWORD to a password of 12–72 UTF-8 bytes before seeding.");
}

const showroomNames = [
  "Lucknow Showroom 1 (assumed)",
  "Lucknow Showroom 2 (assumed)",
  "Lucknow Showroom 3 (assumed)",
];

const demoAccounts = [
  { name: "Assumed Administrator", email: "admin@drivehub.example.invalid", role: "ADMIN" },
  { name: "Assumed Consultant One", email: "consultant.one@drivehub.example.invalid", role: "CONSULTANT", showroomIndex: 0 },
  { name: "Assumed Consultant Two", email: "consultant.two@drivehub.example.invalid", role: "CONSULTANT", showroomIndex: 1 },
  { name: "Assumed Consultant Three", email: "consultant.three@drivehub.example.invalid", role: "CONSULTANT", showroomIndex: 2 },
  { name: "Assumed Buyer One", email: "buyer.one@drivehub.example.invalid", role: "BUYER" },
  { name: "Assumed Buyer Two", email: "buyer.two@drivehub.example.invalid", role: "BUYER" },
];

async function seedCityAndShowrooms() {
  const city = await prisma.city.upsert({
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

  const showrooms = [];
  for (const name of showroomNames) {
    showrooms.push(
      await prisma.showroom.upsert({
        where: { name_cityId: { name, cityId: city.id } },
        update: { isAssumed: true },
        create: { name, cityId: city.id, isAssumed: true },
      }),
    );
  }
  return { city, showrooms };
}

async function seedVehicle(record, { isDemo = false, showroomId = null } = {}) {
  const model = await prisma.carModel.upsert({
    where: { brand_name: { brand: "Brand X", name: record.model } },
    update: {},
    create: { brand: "Brand X", name: record.model },
  });

  const variant = await prisma.carVariant.upsert({
    where: { modelId_name: { modelId: model.id, name: record.variant } },
    update: { fuel: record.fuel },
    create: { modelId: model.id, name: record.variant, fuel: record.fuel },
  });

  const data = {
    type: record.type,
    variantId: variant.id,
    year: record.year,
    kilometres: record.kilometres,
    priceInr: record.priceInr ?? null,
    priceType: record.priceType ?? (record.priceBasis === "LISTING" ? "LISTING_PRICE" : record.priceBasis),
    status: record.status,
    isDemo,
    showroomId,
  };
  await prisma.vehicleInventory.upsert({
    where: { stockId: record.stockId },
    update: data,
    create: { stockId: record.stockId, ...data },
  });
}

async function seedAssumedAccounts(showrooms) {
  const passwordHash = await hash(demoPassword, 12);
  const usersByEmail = {};
  for (const account of demoAccounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        role: account.role,
        passwordHash,
        isActive: true,
        isDemo: true,
      },
      create: {
        name: account.name,
        email: account.email,
        role: account.role,
        passwordHash,
        isDemo: true,
      },
      select: { id: true },
    });
    usersByEmail[account.email] = user.id;

    if (account.role === "CONSULTANT") {
      await prisma.consultant.upsert({
        where: { userId: user.id },
        update: { showroomId: showrooms[account.showroomIndex].id, isActive: true },
        create: { userId: user.id, showroomId: showrooms[account.showroomIndex].id },
      });
    }
  }
  return usersByEmail;
}

async function seedDemoCarsAndSlots(showrooms) {
  const demoCars = [
    {
      stockId: "DEMO-LKO-01",
      type: "NEW",
      model: "Model H",
      variant: "ZX Automatic",
      fuel: "PETROL",
      year: 2026,
      kilometres: 0,
      priceType: "EX_SHOWROOM",
      status: "AVAILABLE",
    },
    {
      stockId: "DEMO-LKO-02",
      type: "NEW",
      model: "Model C",
      variant: "VX",
      fuel: "DIESEL",
      year: 2026,
      kilometres: 0,
      priceType: "EX_SHOWROOM",
      status: "AVAILABLE",
    },
  ];

  const now = new Date();
  for (const [index, record] of demoCars.entries()) {
    await seedVehicle(record, { isDemo: true, showroomId: showrooms[0].id });
    const startsAt = new Date(now);
    startsAt.setDate(startsAt.getDate() + 2);
    startsAt.setHours(index === 0 ? 11 : 14, 0, 0, 0);
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
    await prisma.testDriveSlot.upsert({
      where: {
        demoVehicleStockId_startsAt: {
          demoVehicleStockId: record.stockId,
          startsAt,
        },
      },
      update: { showroomId: showrooms[0].id, endsAt },
      create: {
        demoVehicleStockId: record.stockId,
        showroomId: showrooms[0].id,
        startsAt,
        endsAt,
        isOpen: true,
      },
    });
  }
}

async function seedAssumedLeads(city, showrooms, usersByEmail) {
  const demoLeads = [
    {
      reference: "DEMO-LEAD-01",
      buyerEmail: "buyer.one@drivehub.example.invalid",
      consultantEmail: "consultant.one@drivehub.example.invalid",
      showroomIndex: 0,
      stockId: "NEW-H-02",
      customerName: "Assumed Buyer One",
      email: "buyer.one@drivehub.example.invalid",
      // Zero-only phone text is non-contactable placeholder data, not a buyer number.
      phone: "0000000000",
      source: "WEBSITE",
      status: "NEW",
      message: "Assumed sample enquiry about the new vehicle.",
    },
    {
      reference: "DEMO-LEAD-02",
      buyerEmail: "buyer.two@drivehub.example.invalid",
      consultantEmail: "consultant.two@drivehub.example.invalid",
      showroomIndex: 1,
      stockId: "UC-1182",
      customerName: "Assumed Buyer Two",
      email: "buyer.two@drivehub.example.invalid",
      phone: "0000000000",
      source: "WEBSITE",
      status: "CONTACTED",
      message: "Assumed sample enquiry about an available used vehicle.",
    },
  ];

  for (const record of demoLeads) {
    const consultant = await prisma.consultant.findUnique({
      where: { userId: usersByEmail[record.consultantEmail] },
      select: { id: true },
    });
    if (!consultant) throw new Error(`Missing seeded consultant for ${record.reference}.`);
    await prisma.lead.upsert({
      where: { reference: record.reference },
      update: {},
      create: {
        reference: record.reference,
        buyerUserId: usersByEmail[record.buyerEmail],
        customerName: record.customerName,
        email: record.email,
        phone: record.phone,
        message: record.message,
        source: record.source,
        status: record.status,
        vehicleStockId: record.stockId,
        cityId: city.id,
        requestedShowroomId: showrooms[record.showroomIndex].id,
        assignedConsultantId: consultant.id,
        assignedAt: new Date(),
        firstRespondedAt: record.status === "CONTACTED" ? new Date() : null,
        assignments: { create: { consultantId: consultant.id } },
        consentRecords: {
          create: {
            type: "CONTACT",
            granted: true,
            source: "ASSUMED_DEMO_LEAD",
          },
        },
      },
    });
  }
}

try {
  const { city, showrooms } = await seedCityAndShowrooms();
  for (const record of officialInventory) await seedVehicle(record);
  const usersByEmail = await seedAssumedAccounts(showrooms);
  await seedDemoCarsAndSlots(showrooms);
  await seedAssumedLeads(city, showrooms, usersByEmail);
  console.info("Seeded three official vehicles and explicitly assumed demo data.");
} catch (error) {
  console.error("Failed to seed dealership data.", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
