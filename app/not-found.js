import Link from "next/link";
import { Container } from "../components/ui";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center bg-[#f7f7f5] py-20">
      <Container>
        <div className="mx-auto max-w-xl border border-[var(--line)] bg-white p-8 text-center sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--accent)]">404 · Not found</p>
          <h1 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">We couldn’t find that vehicle.</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">It may not be part of the current sample inventory.</p>
          <Link href="/new-cars" className="mt-6 inline-flex min-h-11 items-center bg-[var(--ink)] px-5 text-sm font-medium text-white hover:bg-[var(--accent)]">
            Browse current stock
          </Link>
        </div>
      </Container>
    </main>
  );
}
