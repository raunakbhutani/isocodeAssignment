"use client";

import { useActionState } from "react";

const initialState = { error: "", success: "" };

export default function AdminActionForm({
  action,
  children,
  className = "",
  submitLabel = "Save changes",
  showSubmit = true,
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={className}>
      {children}
      {(state.error || state.success) && (
        <p
          role={state.error ? "alert" : "status"}
          className={`mt-3 text-xs ${state.error ? "text-red-700" : "text-emerald-800"}`}
        >
          {state.error || state.success}
        </p>
      )}
      {showSubmit && (
        <button
          className="mt-4 min-h-10 bg-[var(--ink)] px-4 text-xs font-medium text-white hover:bg-[var(--accent)] disabled:opacity-50"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
      )}
    </form>
  );
}
