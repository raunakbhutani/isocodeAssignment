"use client";

import { useActionState } from "react";
import { submitEnquiry } from "../app/actions/leads";
import { InfoNotice } from "./ui";
import { Button, Card } from "./ui/primitives";
import { vehicles } from "../lib/mock-data";

const initialState = { error: "", success: "" };

export default function EnquiryForm({ vehicleStockId = "" }) {
  const [state, formAction, isPending] = useActionState(submitEnquiry, initialState);
  const vehicle = vehicles.find((item) => item.stockId === vehicleStockId);

  return (
    <Card className="p-5 sm:p-8">
      <InfoNotice title="Lead assignment:">
        Your contact details are shared with an assigned Company A consultant only after you submit.
      </InfoNotice>
      <form action={formAction} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-label">
            Your name
            <input className="form-input" name="name" autoComplete="name" placeholder="Full name" required minLength="2" maxLength="100" />
          </label>
          <label className="form-label">
            Phone
            <input className="form-input" name="phone" type="tel" autoComplete="tel" placeholder="Phone number" required />
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
          <textarea className="form-input min-h-32 resize-y py-3" name="message" placeholder="How can our team help?" maxLength="2000" />
        </label>
        <label className="flex items-start gap-3 text-xs leading-5 text-[var(--muted)]">
          <input className="mt-1 accent-[var(--accent)]" type="checkbox" name="contactConsent" required />
          Company A may contact me about this enquiry.
        </label>
        <label className="flex items-start gap-3 text-xs leading-5 text-[var(--muted)]">
          <input className="mt-1 accent-[var(--accent)]" type="checkbox" name="marketingConsent" />
          I also agree to receive optional marketing messages.
        </label>
        {(state.error || state.success) && (
          <p role={state.error ? "alert" : "status"} className="text-sm text-[var(--muted)]">
            {state.error || state.success}
          </p>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Send enquiry"}
        </Button>
      </form>
    </Card>
  );
}
