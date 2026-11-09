import Link from "next/link";
import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-lg px-5 py-20">
      <p className="eyebrow">DriveHub account</p>
      <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Use your buyer, consultant, or administrator account.
      </p>
      <LoginForm />
      <p className="mt-6 text-sm text-[var(--muted)]">
        New buyer? <Link className="underline" href="/register">Create an account</Link>
      </p>
    </main>
  );
}
