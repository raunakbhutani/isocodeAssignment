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
  { name: "Assumed Consultant Four", email: "consultant.four@drivehub.example.invalid", role: "CONSULTANT", showroomIndex: 0 },
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

async function seedVehicle(record, { isDemo = false, showroomId = null, isOfficial = false } = {}) {
  const model = await prisma.carModel.upsert({
    where: { brand_name: { brand: "Brand X", name: record.model } },
    update: {},
    create: { brand: "Brand X", name: record.model },
  });

  const variant = await prisma.carVariant.upsert({
    where: { modelId_name: { modelId: model.id, name: record.variant } },
    update: {},
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
    previousOwners: record.type === "USED" ? (record.stockId === "UC-1182" ? 1 : 2) : null,
    inspectionReport: record.type === "USED"
      ? `Assumed demo inspection summary for ${record.stockId}; replace with a verified inspection report.`
      : null,
    detailsAreAssumed: record.type === "USED",
    showroomId,
  };
  await prisma.vehicleInventory.upsert({
    where: { stockId: record.stockId },
    update: isOfficial ? {} : data,
    create: { stockId: record.stockId, ...data },
  });
  return { model, variant };
}

async function seedAssumedPricing(variant, city) {
  const effectiveFrom = new Date("2026-01-01T00:00:00.000Z");
  await prisma.cityPrice.upsert({
    where: {
      cityId_variantId_effectiveFrom: {
        cityId: city.id,
        variantId: variant.id,
        effectiveFrom,
      },
    },
    update: {},
    create: {
      cityId: city.id,
      variantId: variant.id,
      exShowroomPriceInr: 1245000,
      roadTaxBasisPoints: 800,
      registrationFeeInr: 10000,
      insuranceInr: 25000,
      accessoriesInr: 15000,
      otherChargesInr: 0,
      isAssumed: true,
      effectiveFrom,
      effectiveUntil: new Date("2026-12-31T23:59:59.999Z"),
    },
  });
}

async function seedAssumedAccounts(showrooms, modelIdsByName) {
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
      const consultant = await prisma.consultant.upsert({
        where: { userId: user.id },
        update: { showroomId: showrooms[account.showroomIndex].id, isActive: true },
        create: { userId: user.id, showroomId: showrooms[account.showroomIndex].id },
        select: { id: true },
      });
      const eligibleModelNames = account.email.includes("consultant.four")
        ? ["Model H"]
        : Object.keys(modelIdsByName);
      await prisma.consultantModel.createMany({
        data: eligibleModelNames.map((name) => ({
          consultantId: consultant.id,
          modelId: modelIdsByName[name],
        })),
        skipDuplicates: true,
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
      where: { id: `ASSUMED-SLOT-${record.stockId}` },
      update: {},
      create: {
        id: `ASSUMED-SLOT-${record.stockId}`,
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
    const vehicle = await prisma.vehicleInventory.findUnique({
      where: { stockId: record.stockId },
      select: { variantId: true, variant: { select: { modelId: true } } },
    });
    if (!vehicle) throw new Error(`Missing seeded vehicle for ${record.reference}.`);
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
        budgetInr: record.stockId === "NEW-H-02" ? 1500000 : 900000,
        purchaseTimeline: record.stockId === "NEW-H-02" ? "WITHIN_1_MONTH" : "ONE_TO_THREE_MONTHS",
        source: record.source,
        status: record.status,
        vehicleStockId: record.stockId,
        variantId: vehicle.variantId,
        cityId: city.id,
        requestedShowroomId: showrooms[record.showroomIndex].id,
        assignedConsultantId: consultant.id,
        assignedAt: new Date(),
        firstRespondedAt: record.status === "CONTACTED" ? new Date() : null,
        assignments: {
          create: {
            consultantId: consultant.id,
            showroomId: showrooms[record.showroomIndex].id,
            modelId: vehicle.variant.modelId,
          },
        },
        notifications: {
          create: {
            recipientConsultantId: consultant.id,
            type: "LEAD_ASSIGNED",
            message: "Assumed sample lead assigned to consultant. Internal acknowledgement only; no external message was sent.",
          },
        },
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
  let newHVariant;
  const modelIdsByName = {};
  for (const record of officialInventory) {
    const seeded = await seedVehicle(record, { isOfficial: true });
    if (record.stockId === "NEW-H-02") newHVariant = seeded.variant;
    modelIdsByName[record.model] = seeded.model.id;
  }
  if (!newHVariant) throw new Error("Official NEW-H-02 variant missing from seed data.");
  await seedAssumedPricing(newHVariant, city);
  const usersByEmail = await seedAssumedAccounts(showrooms, modelIdsByName);
  await seedDemoCarsAndSlots(showrooms);
  await seedAssumedLeads(city, showrooms, usersByEmail);
  console.info("Seeded three official vehicles and explicitly assumed demo data.");
} catch (error) {
  console.error("Failed to seed dealership data.", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
