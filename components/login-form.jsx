"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    setIsSubmitting(false);
    if (!result?.ok) {
      setError("Email or password is incorrect, or this account is inactive.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
      <label className="form-label">
        Email
        <input className="form-input" type="email" name="email" autoComplete="email" required />
      </label>
      <label className="form-label">
        Password
        <input className="form-input" type="password" name="password" autoComplete="current-password" required />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button
        className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[var(--ink)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent)] disabled:opacity-50"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
