// Keep display formatting in one place so prices look consistent on every screen.
export function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function displayFuel(fuel) {
  return fuel.charAt(0) + fuel.slice(1).toLowerCase();
}

export function displayAvailability(status) {
  return status === "AVAILABLE" ? "Available" : status === "BOOKED" ? "Booked" : "Sold";
}
