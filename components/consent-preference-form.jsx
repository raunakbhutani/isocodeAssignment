"use client";

import { useActionState } from "react";
import { setBuyerConsent } from "@/app/actions/leads";

const initialState = { error: "", success: "" };

export default function ConsentPreferenceForm({ currentPreference }) {
  const [state, formAction, isPending] = useActionState(setBuyerConsent, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ink)]">
        <input
          type="checkbox"
          name="marketingConsent"
          value="true"
          defaultChecked={currentPreference}
          className="mt-1 accent-[var(--accent)]"
        />
        I agree to receive optional marketing messages from Company A. This choice does not affect service enquiries.
      </label>
      <input type="hidden" name="marketingConsent" value="false" />
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-800">{state.success}</p>}
      <button
        className="min-h-11 bg-[var(--ink)] px-5 text-sm font-medium text-white hover:bg-[var(--accent)] disabled:opacity-50"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Save preference"}
      </button>
    </form>
  );
}
