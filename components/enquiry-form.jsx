"use client";

import { useActionState } from "react";
import { submitEnquiry } from "../app/actions/leads";
import { InfoNotice } from "./ui";
import { Button, Card } from "./ui/primitives";
import { useBuyerLanguage } from "./buyer-language-provider";

const initialState = { error: "", success: "" };
const timelineOptions = [
  ["IMMEDIATELY", "As soon as possible"],
  ["WITHIN_1_MONTH", "Within a month"],
  ["ONE_TO_THREE_MONTHS", "1–3 months"],
  ["THREE_TO_SIX_MONTHS", "3–6 months"],
  ["JUST_EXPLORING", "Just exploring"],
];

export default function EnquiryForm({ vehicleStockId = "", vehicles, showrooms }) {
  const [state, formAction, isPending] = useActionState(submitEnquiry, initialState);
  const { t } = useBuyerLanguage();

  return (
    <Card className="p-5 sm:p-8">
      <InfoNotice title="Lead assignment and privacy:">
        Limited enquiry details (vehicle interest, budget, timeline, showroom, and message) may be processed by Gemini to prepare an internal summary and reply draft. Your name, email, and phone are not sent to Gemini. A consultant reviews all AI content; no message is sent automatically.
      </InfoNotice>
      <form action={formAction} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("Full name")}>
            <input className="form-input" name="name" autoComplete="name" placeholder="Full name" required minLength="2" maxLength="100" />
          </Field>
          <Field label={t("Email")}>
            <input className="form-input" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          </Field>
        </div>
        <Field label={t("Phone")}>
          <input className="form-input" name="phone" type="tel" autoComplete="tel" placeholder="Phone number" required />
        </Field>
        <Field label={t("Interested model and variant")}>
          <select className="form-input" name="vehicleStockId" defaultValue={vehicleStockId} required>
            <option value="" disabled>{t("Select a vehicle")}</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.stockId} value={vehicle.stockId}>
                {vehicle.model} · {vehicle.variant} · {vehicle.stockId} ({vehicle.status.toLowerCase()})
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("Preferred showroom")}>
          <select className="form-input" name="showroomId" defaultValue="" required>
            <option value="" disabled>{t("Select a showroom")}</option>
            {showrooms.map((showroom) => <option key={showroom.id} value={showroom.id}>{showroom.name}</option>)}
          </select>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("Budget (₹, optional)")}>
            <input className="form-input" type="number" name="budgetInr" min="0" max="2000000000" />
          </Field>
          <Field label={t("Purchase timeline")}>
            <select className="form-input" name="purchaseTimeline" defaultValue="">
              <option value="">{t("Select a timeline")}</option>
              {timelineOptions.map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}
            </select>
          </Field>
        </div>
        <Field label={t("Additional message")}>
          <textarea className="form-input min-h-32 resize-y py-3" name="message" placeholder="How can our team help?" maxLength="2000" />
        </Field>
        <label className="flex items-start gap-3 text-xs leading-5 text-[var(--muted)]">
          <input className="mt-1 accent-[var(--accent)]" type="checkbox" name="contactConsent" required />
          {t("I have read the privacy notice and consent to Company A using my details to respond. Limited enquiry details may be processed by Gemini to prepare an internal summary and reply draft.")}
        </label>
        <label className="flex items-start gap-3 text-xs leading-5 text-[var(--muted)]">
          <input className="mt-1 accent-[var(--accent)]" type="checkbox" name="marketingConsent" />
          {t("I also agree to receive optional marketing messages.")}
        </label>
        {(state.error || state.success) && (
          <p role={state.error ? "alert" : "status"} className={`text-sm ${state.error ? "text-red-700" : "text-emerald-800"}`}>
            {state.error || state.success}
          </p>
        )}
        <Button type="submit" disabled={isPending || vehicles.length === 0 || showrooms.length === 0}>
          {isPending ? t("Sending...") : t("Send an enquiry")}
        </Button>
      </form>
    </Card>
  );
}

function Field({ label, children }) {
  return <label className="form-label">{label}{children}</label>;
}
