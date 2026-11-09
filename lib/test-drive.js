export class BookingConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "BookingConflictError";
  }
}

export function isBookableDemoSlot(slot, requestedShowroomId, requestedVehicleStockId, now = new Date()) {
  return Boolean(
    slot &&
      slot.isOpen &&
      slot.showroomId === requestedShowroomId &&
    slot.showroom?.isActive &&
    slot.demoVehicleStockId === requestedVehicleStockId &&
      slot.demoVehicle.isDemo &&
      slot.demoVehicle.status === "AVAILABLE" &&
      slot.startsAt > now,
  );
}
