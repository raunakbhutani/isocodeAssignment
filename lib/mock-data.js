import { officialInventory } from "../prisma/seed-data.mjs";

const vehiclePhotos = [
  "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",
];

// These view models preserve the brief's records. Photos and non-official fields are placeholders only.
export const vehicles = officialInventory.map((record, index) => ({
  ...record,
  slug: record.stockId,
  image: vehiclePhotos[index],
  imageAlt: `Placeholder photo only; not a photograph of stock unit ${record.stockId}`,
  owners: null,
  registrationNumber: null,
  inspectionReport: null,
}));

// Fictional placeholder leads help demonstrate staff screens; these are not real customer records.
export const leads = [
  {
    id: "DEMO-LEAD-01",
    name: "Sample Buyer One",
    email: "buyer.one@example.invalid",
    phone: "Not provided",
    vehicleStockId: "NEW-H-02",
    source: "Website enquiry",
    status: "New",
    assignedTo: "Assignment not connected",
    receivedAt: "Demo record",
    responseTimer: "Timer starts for live leads",
    enquiry: "Sample enquiry text. No customer message was supplied.",
    aiSummary: "Illustrative summary only. Gemini is not connected.",
    firstReply:
      "Hello, thank you for your interest in the Model H ZX Automatic. A Company A consultant will be in touch to answer your questions.",
  },
  {
    id: "DEMO-LEAD-02",
    name: "Sample Buyer Two",
    email: "buyer.two@example.invalid",
    phone: "Not provided",
    vehicleStockId: "UC-1182",
    source: "Website enquiry",
    status: "Contacted",
    assignedTo: "Assignment not connected",
    receivedAt: "Demo record",
    responseTimer: "Timer starts for live leads",
    enquiry: "Sample enquiry text. No customer message was supplied.",
    aiSummary: "Illustrative summary only. Gemini is not connected.",
    firstReply:
      "Hello, thank you for your interest in the Model C VX. A Company A consultant will be in touch with more information.",
  },
];

export const showrooms = [
  { id: "showroom-1", label: "Showroom 1 — name and address to be confirmed" },
  { id: "showroom-2", label: "Showroom 2 — name and address to be confirmed" },
  { id: "showroom-3", label: "Showroom 3 — name and address to be confirmed" },
];

// Example choices are explicitly assumptions for layout and are not bookable in this preview.
export const demoSlots = ["10:00 AM", "12:30 PM", "03:00 PM"];

export const cityPricing = [];
export const consultants = [];
