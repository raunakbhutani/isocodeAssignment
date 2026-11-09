"use client";

import { useActionState } from "react";
import { reassignLead } from "@/app/actions/consultant";

const initialState = { error: "", success: "" };

export default function LeadAssignmentForm({ leadId, assignedConsultantId, consultants }) {
  const [state, formAction, isPending] = useActionState(reassignLead, initialState);

  if (!consultants.length) {
    return <p className="text-xs leading-5 text-amber-800">No eligible active consultant is configured for this showroom and model. This lead remains in the admin queue.</p>;
  }

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="leadId" value={leadId} />
      <label className="form-label">
        Assign to eligible consultant
        <select className="form-input" name="consultantId" defaultValue={assignedConsultantId ?? ""} required>
          <option value="" disabled>Select a consultant</option>
          {consultants.map((consultant) => (
            <option key={consultant.id} value={consultant.id}>
              {consultant.user.name}{consultant.id === assignedConsultantId ? " (current)" : ""}
            </option>
          ))}
        </select>
      </label>
      {state.error && <p role="alert" className="mt-3 text-xs text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="mt-3 text-xs text-emerald-800">{state.success}</p>}
      <button className="mt-3 min-h-10 bg-[var(--ink)] px-4 text-xs font-medium text-white hover:bg-[var(--accent)] disabled:opacity-50" type="submit" disabled={isPending}>
        {isPending ? "Assigning..." : "Save assignment"}
      </button>
    </form>
  );
}
