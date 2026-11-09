import { DemoNotice } from "./ui";
import { vehicles } from "../lib/mock-data";

export default function TestDriveForm({ vehicleStockId = "" }) {
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === "AVAILABLE");

  return (
    <div className="border border-[var(--line)] bg-white p-5 sm:p-8">
      <DemoNotice>Form fields are for layout preview only. No booking is sent or saved.</DemoNotice>
      <form className="mt-7 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-label">
            First name
            <input className="form-input" name="firstName" placeholder="Your first name" autoComplete="given-name" />
          </label>
          <label className="form-label">
            Last name
            <input className="form-input" name="lastName" placeholder="Your last name" autoComplete="family-name" />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-label">
            Email
            <input className="form-input" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </label>
          <label className="form-label">
            Phone
            <input className="form-input" name="phone" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-label">
            Vehicle
            <select className="form-input" name="vehicleStockId" defaultValue={vehicleStockId}>
              <option value="">Choose a vehicle</option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.stockId} value={vehicle.stockId}>
                  {vehicle.model} {vehicle.variant} — {vehicle.stockId}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Preferred date
            <input className="form-input" name="date" type="date" />
          </label>
        </div>
        <label className="form-label">
          Anything we should know?
          <textarea className="form-input min-h-28 resize-y py-3" name="message" placeholder="Share a preferred time or any questions." />
        </label>
        <button
          type="button"
          disabled
          className="min-h-12 w-full cursor-not-allowed bg-[var(--ink)] px-6 text-sm font-medium text-white opacity-50 sm:w-auto"
          title="Booking submission is not connected in this preview"
        >
          Request a test drive — preview only
        </button>
      </form>
    </div>
  );
}
