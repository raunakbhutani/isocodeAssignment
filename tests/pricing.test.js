import { describe, expect, it } from "vitest";
import { calculateOnRoadPrice } from "../lib/pricing.js";

describe("on-road price calculation", () => {
  it("adds ex-showroom, rounded road tax, and itemized fees", () => {
    expect(
      calculateOnRoadPrice(1245000, {
        roadTaxBasisPoints: 800,
        registrationFeeInr: 10000,
        insuranceInr: 25000,
        otherChargesInr: 1500,
      }),
    ).toEqual({
      exShowroomPriceInr: 1245000,
      roadTaxInr: 99600,
      registrationFeeInr: 10000,
      insuranceInr: 25000,
      otherChargesInr: 1500,
      totalInr: 1381100,
    });
  });

  it("rejects fractional, negative, and out-of-range inputs", () => {
    expect(() => calculateOnRoadPrice(100.5, {
      roadTaxBasisPoints: 500,
      registrationFeeInr: 0,
      insuranceInr: 0,
      otherChargesInr: 0,
    })).toThrow();
    expect(() => calculateOnRoadPrice(1000, {
      roadTaxBasisPoints: 10001,
      registrationFeeInr: 0,
      insuranceInr: 0,
      otherChargesInr: 0,
    })).toThrow();
  });
});
