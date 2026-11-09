import { describe, expect, it } from "vitest";
import { leadInputSchema } from "../lib/validation.js";

const validLead = {
  customerName: "Sample Buyer",
  email: "BUYER@example.invalid",
  phone: "+91 98765 43210",
  message: "Please share details.",
  vehicleStockId: "NEW-H-02",
  showroomId: "clh1234567890123456789012",
  contactConsent: true,
  marketingConsent: false,
};

describe("lead input validation", () => {
  it("normalizes email and accepts a valid lead with required contact consent", () => {
    const result = leadInputSchema.safeParse(validLead);
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("buyer@example.invalid");
  });

  it("rejects a lead without explicit contact consent", () => {
    const result = leadInputSchema.safeParse({ ...validLead, contactConsent: false });
    expect(result.success).toBe(false);
  });

  it("rejects malformed email and phone values", () => {
    const result = leadInputSchema.safeParse({
      ...validLead,
      email: "not-an-email",
      phone: "call me",
    });
    expect(result.success).toBe(false);
  });

  it("requires a selected vehicle and showroom", () => {
    expect(leadInputSchema.safeParse({ ...validLead, vehicleStockId: "" }).success).toBe(false);
    expect(leadInputSchema.safeParse({ ...validLead, showroomId: "" }).success).toBe(false);
  });
});
