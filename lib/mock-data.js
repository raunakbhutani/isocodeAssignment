import { officialInventory } from "../prisma/seed-data.mjs";

// These records mirror the official seed for the temporary, database-free UI preview.
// The photographs are illustrative only; they are not photographs of these stock units.
export const vehicles = officialInventory.map((record, index) => ({
  ...record,
  slug: record.stockId,
  make: "Brand X",
  condition: record.type === "NEW" ? "New" : "Pre-owned",
  model: record.model,
  image: [
    "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",
  ][index],
  imageAlt: `Illustrative photo only; not a photograph of stock unit ${record.stockId}`,
  tag: record.status === "BOOKED" ? "Booked" : record.type === "NEW" ? "New" : "Available",
}));

// Temporary lead records are fictional demo data and are not Company A customer records.
export const leads = [
  {
    id: "DEMO-LEAD-01",
    name: "Sample Buyer One",
    email: "buyer.one@example.invalid",
    phone: "Not provided",
    vehicle: "Model H ZX Automatic",
    source: "Website enquiry",
    status: "New",
    owner: "Sample consultant",
    date: "Sample record",
    interest: "Demo enquiry; no real customer message has been supplied.",
    nextStep: "Contact details and next step are not configured in this preview.",
  },
  {
    id: "DEMO-LEAD-02",
    name: "Sample Buyer Two",
    email: "buyer.two@example.invalid",
    phone: "Not provided",
    vehicle: "Model C VX",
    source: "Website enquiry",
    status: "Contacted",
    owner: "Sample consultant",
    date: "Sample record",
    interest: "Demo enquiry; no real customer message has been supplied.",
    nextStep: "Contact details and next step are not configured in this preview.",
  },
];

export const mockPricing = vehicles.map((vehicle) => ({
  model: vehicle.model,
  trim: vehicle.variant,
  price: vehicle.priceInr,
  priceBasis: vehicle.priceBasis,
  availability: vehicle.status === "AVAILABLE" ? "Available" : "Booked",
}));
