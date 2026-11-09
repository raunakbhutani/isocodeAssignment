"use client";

import { useActionState } from "react";
import { registerBuyer } from "@/app/actions/auth";

const initialState = { error: "", success: "" };

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerBuyer, initialState);

  return (
    <form action={formAction} className="mt-8 grid gap-4">
      <label className="form-label">
        Name
        <input className="form-input" name="name" autoComplete="name" minLength="2" maxLength="100" required />
      </label>
      <label className="form-label">
        Email
        <input className="form-input" type="email" name="email" autoComplete="email" required />
      </label>
      <label className="form-label">
        Password (at least 12 characters)
        <input className="form-input" type="password" name="password" minLength="12" autoComplete="new-password" required />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-800">{state.success}</p>}
      <button
        className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[var(--ink)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent)] disabled:opacity-50"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
