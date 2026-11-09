"use client";

import { useState } from "react";
import { demoSlots, showrooms, vehicles } from "../lib/mock-data";
import { DemoNotice, InfoNotice } from "./ui";
import { Button } from "./ui/primitives";

export default function TestDriveForm({ vehicleStockId = "" }) {
  // Prefill from a vehicle-detail link and keep any selection local to this preview.
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleStockId);
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === "AVAILABLE");

  return (
    <div className="border border-[var(--line)] bg-white p-5 sm:p-8">
      <DemoNotice>
        This form previews the booking flow. Showrooms and time slots are assumptions; no request is submitted or saved.
      </DemoNotice>
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
            <input className="form-input" name="phone" type="tel" placeholder="Your phone number" autoComplete="tel" />
          </label>
        </div>
        <label className="form-label">
          Preferred showroom
          <select className="form-input" name="showroom" defaultValue="">
            <option value="" disabled>Select a showroom</option>
            {showrooms.map((showroom) => <option key={showroom.id} value={showroom.id}>{showroom.label}</option>)}
          </select>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-label">
            Demo car
            <select
              className="form-input"
              name="vehicleStockId"
              value={selectedVehicle}
              onChange={(event) => setSelectedVehicle(event.target.value)}
            >
              <option value="">Choose an available vehicle</option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.stockId} value={vehicle.stockId}>
                  {vehicle.model} {vehicle.variant} · {vehicle.stockId}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Preferred date
            <input className="form-input" name="date" type="date" />
          </label>
        </div>
        <fieldset>
          <legend className="text-xs font-medium text-[var(--ink)]">Example time slots</legend>
          <p className="mt-1 text-[10px] text-[var(--muted)]">Assumed options for layout only—not confirmed availability.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {demoSlots.map((slot) => (
              <label key={slot} className="cursor-pointer">
                <input className="peer sr-only" type="radio" name="timeSlot" value={slot} />
                <span className="flex min-h-11 items-center justify-center border border-[var(--line)] px-2 text-xs text-[var(--muted)] peer-checked:border-[var(--accent)] peer-checked:bg-[#fbf6f4] peer-checked:text-[var(--ink)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)]">
                  {slot}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="form-label">
          Anything we should know?
          <textarea className="form-input min-h-28 resize-y py-3" name="message" placeholder="Share a preferred time or any questions." />
        </label>
        <InfoNotice title="Not connected:">
          No appointment can be made from this preview. A live booking requires confirmed showroom, demo-car, and slot data.
        </InfoNotice>
        <Button type="button" disabled title="Booking submission is not connected">
          Request a test drive
        </Button>
      </form>
    </div>
  );
}
