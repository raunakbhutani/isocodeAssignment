import { describe, expect, it } from "vitest";
import { officialInventory } from "../prisma/seed-data.mjs";

describe("official Company A inventory seed", () => {
  it("contains exactly the three records supplied by the brief", () => {
    expect(officialInventory).toHaveLength(3);
    expect(officialInventory.map(({ stockId }) => stockId)).toEqual([
      "NEW-H-02",
      "UC-1182",
      "UC-1190",
    ]);
  });

  it("keeps the new vehicle's ex-showroom price distinct from on-road pricing", () => {
    expect(officialInventory[0]).toMatchObject({
      stockId: "NEW-H-02",
      type: "NEW",
      model: "Model H",
      variant: "ZX Automatic",
      fuel: "PETROL",
      year: 2026,
      kilometres: 0,
      priceInr: 1245000,
      priceBasis: "EX_SHOWROOM",
      priceType: "EX_SHOWROOM",
      status: "AVAILABLE",
    });
  });

  it("preserves both used-car listing prices and their exact statuses", () => {
    expect(officialInventory[1]).toMatchObject({
      stockId: "UC-1182",
      type: "USED",
      priceInr: 845000,
      priceBasis: "LISTING",
      priceType: "LISTING_PRICE",
      status: "AVAILABLE",
    });
    expect(officialInventory[2]).toMatchObject({
      stockId: "UC-1190",
      type: "USED",
      priceInr: 512000,
      priceBasis: "LISTING",
      priceType: "LISTING_PRICE",
      status: "BOOKED",
    });
  });

  it("does not invent vehicle registration numbers", () => {
    for (const vehicle of officialInventory) {
      expect(vehicle).not.toHaveProperty("registrationNumber");
    }
  });
});
