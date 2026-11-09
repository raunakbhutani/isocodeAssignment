import { InfoNotice } from "./ui";
import { Button, Card } from "./ui/primitives";
import { vehicles } from "../lib/mock-data";

export default function EnquiryForm({ vehicleStockId = "" }) {
  const vehicle = vehicles.find((item) => item.stockId === vehicleStockId);

  return (
    <Card className="p-5 sm:p-8">
      <InfoNotice title="Preview only:">
        This form does not create a lead or send customer information.
      </InfoNotice>
      <form className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-label">
            Your name
            <input className="form-input" name="name" autoComplete="name" placeholder="Full name" />
          </label>
          <label className="form-label">
            Phone
            <input className="form-input" name="phone" type="tel" autoComplete="tel" placeholder="Phone number" />
          </label>
        </div>
        <label className="form-label">
          Email
          <input className="form-input" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        </label>
        <label className="form-label">
          Vehicle of interest
          <select className="form-input" name="vehicleStockId" defaultValue={vehicle?.stockId ?? ""}>
            <option value="">Choose a vehicle</option>
            {vehicles.map((item) => (
              <option key={item.stockId} value={item.stockId}>
                {item.model} {item.variant} · {item.stockId} · {item.status}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Your question
          <textarea className="form-input min-h-32 resize-y py-3" name="message" placeholder="How can our team help?" />
        </label>
        <Button type="button" disabled title="Lead capture is not connected">
          Send enquiry
        </Button>
      </form>
    </Card>
  );
}
