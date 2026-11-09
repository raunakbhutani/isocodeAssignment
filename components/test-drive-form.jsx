"use client";

import { useActionState, useMemo, useState } from "react";
import { requestTestDrive } from "../app/actions/leads";
import { InfoNotice } from "./ui";
import { Button } from "./ui/primitives";

const initialState = { error: "", success: "", confirmation: null };
const timelineOptions = [
  ["IMMEDIATELY", "As soon as possible"],
  ["WITHIN_1_MONTH", "Within a month"],
  ["ONE_TO_THREE_MONTHS", "1–3 months"],
  ["THREE_TO_SIX_MONTHS", "3–6 months"],
  ["JUST_EXPLORING", "Just exploring"],
];

function localDateValue(value) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function TestDriveForm({ slots, vehicles, vehicleStockId = "" }) {
  const [state, formAction, isPending] = useActionState(requestTestDrive, initialState);
  const showrooms = useMemo(
    () => [...new Map(slots.map((slot) => [slot.showroom.id, slot.showroom])).values()],
    [slots],
  );
  const firstSlot = slots[0];
  const [selectedShowroom, setSelectedShowroom] = useState(firstSlot?.showroom.id ?? "");
  const [selectedDemoCar, setSelectedDemoCar] = useState(firstSlot?.demoVehicle.stockId ?? "");
  const [selectedSlot, setSelectedSlot] = useState(firstSlot?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(firstSlot ? localDateValue(firstSlot.startsAt) : "");
  const [selectedInterestVehicle, setSelectedInterestVehicle] = useState(
    vehicles.some((vehicle) => vehicle.stockId === vehicleStockId)
      ? vehicleStockId
      : vehicles[0]?.stockId ?? "",
  );

  const showroomSlots = slots.filter((slot) => slot.showroom.id === selectedShowroom);
  const demoCars = [...new Map(showroomSlots.map((slot) => [slot.demoVehicle.stockId, slot.demoVehicle])).values()];
  const carSlots = showroomSlots.filter((slot) => slot.demoVehicle.stockId === selectedDemoCar);
  const dates = [...new Set(carSlots.map((slot) => localDateValue(slot.startsAt)))];
  const dateSlots = carSlots.filter((slot) => localDateValue(slot.startsAt) === selectedDate);

  function changeShowroom(showroomId) {
    const first = slots.find((slot) => slot.showroom.id === showroomId);
    setSelectedShowroom(showroomId);
    setSelectedDemoCar(first?.demoVehicle.stockId ?? "");
    setSelectedSlot(first?.id ?? "");
    setSelectedDate(first ? localDateValue(first.startsAt) : "");
  }

  function changeDemoCar(stockId) {
    const first = slots.find((slot) =>
      slot.showroom.id === selectedShowroom && slot.demoVehicle.stockId === stockId,
    );
    setSelectedDemoCar(stockId);
    setSelectedSlot(first?.id ?? "");
    setSelectedDate(first ? localDateValue(first.startsAt) : "");
  }

  if (state.confirmation) {
    const confirmation = state.confirmation;
    return (
      <section className="border border-emerald-200 bg-white p-6 sm:p-8" aria-live="polite">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800">Booking confirmed</p>
        <h2 className="mt-3 text-2xl font-medium text-[var(--ink)]">Your test-drive slot is reserved.</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{state.success}</p>
        <dl className="mt-6 grid gap-4 border-t border-[var(--line)] pt-5 sm:grid-cols-2">
          <ConfirmationItem label="Reference" value={confirmation.reference} />
          <ConfirmationItem label="Vehicle of interest" value={confirmation.interestedVehicle} />
          <ConfirmationItem label="Demo car" value={confirmation.demoVehicleName} />
          <ConfirmationItem label="Showroom" value={confirmation.showroomName} />
          <ConfirmationItem
            label="Date and time"
            value={new Date(confirmation.startsAt).toLocaleString("en-IN", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          />
        </dl>
        <p className="mt-5 text-xs text-[var(--muted)]">An internal acknowledgement was recorded. No WhatsApp or SMS was sent.</p>
      </section>
    );
  }

  return (
    <div className="border border-[var(--line)] bg-white p-5 sm:p-8">
      <InfoNotice title="Availability and privacy:">
        Only separate, available demo cars with open database slots can be booked. Your required consent lets Company A contact you about this appointment.
      </InfoNotice>
      <form action={formAction} className="mt-7 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input className="form-input" name="name" placeholder="Full name" autoComplete="name" required minLength="2" maxLength="100" />
          </Field>
          <Field label="Email">
            <input className="form-input" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </Field>
        </div>
        <Field label="Phone">
          <input className="form-input" name="phone" type="tel" placeholder="Your phone number" autoComplete="tel" required />
        </Field>
        <Field label="Vehicle you are interested in (model and variant)">
          <select
            className="form-input"
            name="vehicleStockId"
            value={selectedInterestVehicle}
            onChange={(event) => setSelectedInterestVehicle(event.target.value)}
            required
            disabled={vehicles.length === 0}
          >
            <option value="">Select an available vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.stockId} value={vehicle.stockId}>
                {vehicle.model} · {vehicle.variant} · {vehicle.stockId}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preferred showroom">
          <select className="form-input" name="showroomId" value={selectedShowroom} onChange={(event) => changeShowroom(event.target.value)} required>
            <option value="">Select a showroom with open times</option>
            {showrooms.map((showroom) => <option key={showroom.id} value={showroom.id}>{showroom.name}</option>)}
          </select>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Available demo car">
            <select
              className="form-input"
              name="demoVehicleStockId"
              value={selectedDemoCar}
              onChange={(event) => changeDemoCar(event.target.value)}
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
          </Field>
          <Field label="Available date">
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
          </Field>
        </div>
        <Field label="Available time">
          <select className="form-input" name="slotId" value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)} required disabled={dateSlots.length === 0}>
            <option value="">Choose a time</option>
            {dateSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {new Date(slot.startsAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Budget (₹, optional)">
            <input className="form-input" type="number" name="budgetInr" min="0" max="2000000000" />
          </Field>
          <Field label="Purchase timeline">
            <select className="form-input" name="purchaseTimeline" defaultValue="">
              <option value="">Select a timeline</option>
              {timelineOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Additional message (optional)">
          <textarea className="form-input min-h-28 resize-y py-3" name="message" placeholder="Share a question or preference." maxLength="2000" />
        </Field>
        <label className="flex items-start gap-3 text-xs leading-5 text-[var(--muted)]">
          <input className="mt-1 accent-[var(--accent)]" type="checkbox" name="contactConsent" required />
          I have read the privacy notice and consent to Company A using my details to arrange and discuss this test drive.
        </label>
        <label className="flex items-start gap-3 text-xs leading-5 text-[var(--muted)]">
          <input className="mt-1 accent-[var(--accent)]" type="checkbox" name="marketingConsent" />
          I also agree to receive optional marketing messages.
        </label>
        {slots.length === 0 && (
          <InfoNotice title="No appointments available:">
            Future times appear after open demo-car slots are configured. NEW-H-02 and booked UC-1190 are not used as demo cars.
          </InfoNotice>
        )}
        {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <Button type="submit" disabled={isPending || slots.length === 0 || vehicles.length === 0}>
          {isPending ? "Confirming..." : "Confirm test-drive booking"}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="form-label">{label}{children}</label>;
}

function ConfirmationItem({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-1.5 text-sm font-medium text-[var(--ink)]">{value}</dd>
    </div>
  );
}
