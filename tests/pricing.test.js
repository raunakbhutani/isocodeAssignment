import { describe, expect, it } from "vitest";
import { calculateOnRoadPrice, selectCityPrice } from "../lib/pricing.js";

const now = new Date("2026-06-15T12:00:00.000Z");
const validPrice = {
  cityId: "lucknow",
  variantId: "variant-h-zx",
  exShowroomPriceInr: 1245000,
  roadTaxBasisPoints: 800,
  registrationFeeInr: 10000,
  insuranceInr: 25000,
  accessoriesInr: 15000,
  otherChargesInr: 0,
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveUntil: new Date("2026-12-31T23:59:59.999Z"),
};

describe("on-road price calculation", () => {
  it("adds ex-showroom, rounded road tax, registration, insurance, and accessories", () => {
    expect(
      calculateOnRoadPrice(validPrice, now),
    ).toEqual({
      exShowroomPriceInr: 1245000,
      roadTaxInr: 99600,
      registrationFeeInr: 10000,
      insuranceInr: 25000,
      accessoriesInr: 15000,
      otherChargesInr: 0,
      totalInr: 1394600,
    });
  });

  it("rejects a missing charge", () => {
    const { insuranceInr: _missing, ...missingPrice } = validPrice;
    expect(() => calculateOnRoadPrice(missingPrice, now)).toThrow(/insuranceInr/);
  });

  it("rejects invalid and expired pricing records", () => {
    expect(() => calculateOnRoadPrice({
      ...validPrice,
      effectiveUntil: new Date("2026-01-01T00:00:00.000Z"),
    }, now)).toThrow(/not valid/);
    expect(() => calculateOnRoadPrice({
      ...validPrice,
      effectiveFrom: new Date("2026-07-01T00:00:00.000Z"),
      effectiveUntil: new Date("2026-06-30T23:59:59.999Z"),
    }, now)).toThrow(/invalid validity/);
    expect(() => calculateOnRoadPrice({
      ...validPrice,
      effectiveFrom: new Date("not a date"),
    }, now)).toThrow(/invalid validity/);
    expect(() => calculateOnRoadPrice(validPrice, new Date("2027-01-01T00:00:00.000Z"))).toThrow(/not valid/);
  });

  it("selects only the valid record for the requested city and variant", () => {
    const cityPrice = {
      ...validPrice,
      cityId: "kanpur",
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
    };
    const futurePrice = {
      ...validPrice,
      effectiveFrom: new Date("2026-07-01T00:00:00.000Z"),
    };
    expect(selectCityPrice([validPrice, cityPrice, futurePrice], "lucknow", "variant-h-zx", now))
      .toEqual(validPrice);
    expect(selectCityPrice([validPrice, cityPrice], "kanpur", "variant-h-zx", now))
      .toEqual(cityPrice);
    expect(selectCityPrice([validPrice], "lucknow", "variant-h-zx", new Date("2027-01-01T00:00:00.000Z")))
      .toBeNull();
  });
});
