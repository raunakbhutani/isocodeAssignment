"use client";

import { useActionState, useMemo, useState } from "react";
import { requestTestDrive } from "../app/actions/leads";
import { InfoNotice } from "./ui";
import { Button } from "./ui/primitives";

const initialState = { error: "", success: "" };

function localDateValue(value) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function TestDriveForm({ slots, vehicleStockId = "" }) {
  const [state, formAction, isPending] = useActionState(requestTestDrive, initialState);
  const showrooms = useMemo(
    () => [...new Map(slots.map((slot) => [slot.showroom.id, slot.showroom])).values()],
    [slots],
  );
  const initialSlot = slots.find((slot) => slot.demoVehicle.stockId === vehicleStockId) ?? slots[0];
  const [selectedShowroom, setSelectedShowroom] = useState(initialSlot?.showroom.id ?? "");
  const [selectedVehicle, setSelectedVehicle] = useState(initialSlot?.demoVehicle.stockId ?? "");
  const [selectedSlot, setSelectedSlot] = useState(initialSlot?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(
    initialSlot ? localDateValue(initialSlot.startsAt) : "",
  );

  const showroomSlots = slots.filter((slot) => slot.showroom.id === selectedShowroom);
  const demoCars = [...new Map(
    showroomSlots.map((slot) => [slot.demoVehicle.stockId, slot.demoVehicle]),
  ).values()];
  const carSlots = showroomSlots.filter((slot) => slot.demoVehicle.stockId === selectedVehicle);
  const dates = [...new Set(carSlots.map((slot) => localDateValue(slot.startsAt)))];
  const dateSlots = carSlots.filter((slot) => localDateValue(slot.startsAt) === selectedDate);

  function changeShowroom(showroomId) {
    const first = slots.find((slot) => slot.showroom.id === showroomId);
    setSelectedShowroom(showroomId);
    setSelectedVehicle(first?.demoVehicle.stockId ?? "");
    setSelectedSlot(first?.id ?? "");
    setSelectedDate(first ? localDateValue(first.startsAt) : "");
  }

  function changeVehicle(stockId) {
    const first = slots.find(
      (slot) => slot.showroom.id === selectedShowroom && slot.demoVehicle.stockId === stockId,
    );
    setSelectedVehicle(stockId);
    setSelectedSlot(first?.id ?? "");
    setSelectedDate(first ? localDateValue(first.startsAt) : "");
  }

  return (
    <div className="border border-[var(--line)] bg-white p-5 sm:p-8">
      <InfoNotice title="Live availability:">
        Only seeded demo cars and open database slots can be requested. A submitted request reserves that slot.
      </InfoNotice>
      <form action={formAction} className="mt-7 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-label">
            Your name
            <input className="form-input" name="name" placeholder="Full name" autoComplete="name" required minLength="2" maxLength="100" />
          </label>
          <label className="form-label">
            Email
            <input className="form-input" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </label>
        </div>
        <label className="form-label">
          Phone
          <input className="form-input" name="phone" type="tel" placeholder="Your phone number" autoComplete="tel" required />
        </label>
        <label className="form-label">
          Preferred showroom
          <select
            className="form-input"
            name="showroomId"
            value={selectedShowroom}
            onChange={(event) => changeShowroom(event.target.value)}
            required
          >
            <option value="">Select a showroom</option>
            {showrooms.map((showroom) => <option key={showroom.id} value={showroom.id}>{showroom.name}</option>)}
          </select>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-label">
            Demo car
            <select
              className="form-input"
              value={selectedVehicle}
              onChange={(event) => changeVehicle(event.target.value)}
              required
              disabled={demoCars.length === 0}
            >
              <option value="">Choose an available demo car</option>
              {demoCars.map((vehicle) => (
                <option key={vehicle.stockId} value={vehicle.stockId}>
                  {vehicle.model} {vehicle.variant} · {vehicle.stockId}
                </option>
              ))}
            </select>
            <input type="hidden" name="vehicleStockId" value={selectedVehicle} />
          </label>
          <label className="form-label">
            Available date
            <select
              className="form-input"
              value={selectedDate}
              onChange={(event) => {
                const nextDate = event.target.value;
                const first = carSlots.find((slot) => localDateValue(slot.startsAt) === nextDate);
                setSelectedDate(nextDate);
                setSelectedSlot(first?.id ?? "");
              }}
              required
              disabled={dates.length === 0}
            >
              <option value="">Choose a date</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="form-label">
          Available time
          <select
            className="form-input"
            name="slotId"
            value={selectedSlot}
            onChange={(event) => setSelectedSlot(event.target.value)}
            required
            disabled={dateSlots.length === 0}
          >
            <option value="">Choose a time</option>
            {dateSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {new Date(slot.startsAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Anything we should know?
          <textarea className="form-input min-h-28 resize-y py-3" name="message" placeholder="Share a question or preference." maxLength="2000" />
        </label>
        <label className="flex items-start gap-3 text-xs leading-5 text-[var(--muted)]">
          <input className="mt-1 accent-[var(--accent)]" type="checkbox" name="contactConsent" required />
          Company A may contact me about this test-drive request.
        </label>
        <label className="flex items-start gap-3 text-xs leading-5 text-[var(--muted)]">
          <input className="mt-1 accent-[var(--accent)]" type="checkbox" name="marketingConsent" />
          I also agree to receive optional marketing messages.
        </label>
        {slots.length === 0 && (
          <InfoNotice title="No appointments available:">
            Open demo-car dates and times will appear here after the database is migrated and seeded.
          </InfoNotice>
        )}
        {(state.error || state.success) && (
          <p role={state.error ? "alert" : "status"} className="text-sm text-[var(--muted)]">
            {state.error || state.success}
          </p>
        )}
        <Button type="submit" disabled={isPending || slots.length === 0}>
          {isPending ? "Submitting..." : "Request a test drive"}
        </Button>
      </form>
    </div>
  );
}
