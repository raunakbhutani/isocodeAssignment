import { describe, expect, it } from "vitest";
import { isBookableDemoSlot } from "../lib/test-drive.js";

const now = new Date("2026-01-01T00:00:00.000Z");
const availableDemoSlot = {
  isOpen: true,
  showroomId: "showroom-id",
  showroom: { isActive: true },
  demoVehicleStockId: "DEMO-LKO-01",
  startsAt: new Date("2026-01-03T11:00:00.000Z"),
  demoVehicle: { isDemo: true, status: "AVAILABLE" },
};

describe("test-drive slot safety", () => {
  it("allows only the matching available demo car at its selected showroom", () => {
    expect(isBookableDemoSlot(availableDemoSlot, "showroom-id", "DEMO-LKO-01", now)).toBe(true);
    expect(isBookableDemoSlot(availableDemoSlot, "showroom-id", "UC-1190", now)).toBe(false);
  });

  it("rejects booked or closed slots and past appointments", () => {
    expect(isBookableDemoSlot({
      ...availableDemoSlot,
      demoVehicleStockId: "UC-1190",
      isOpen: false,
      demoVehicle: { isDemo: false, status: "BOOKED" },
    }, "showroom-id", "UC-1190", now)).toBe(false);
    expect(isBookableDemoSlot({
      ...availableDemoSlot,
      startsAt: new Date("2025-12-31T23:59:00.000Z"),
    }, "showroom-id", "DEMO-LKO-01", now)).toBe(false);
  });
});
