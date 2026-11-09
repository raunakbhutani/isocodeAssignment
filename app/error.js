"use client";

import { Container } from "../components/ui";
import { Button } from "../components/ui/primitives";

export default function ErrorPage({ reset }) {
  return (
    <main className="flex flex-1 items-center bg-[#f7f7f5] py-20">
      <Container>
        <div className="mx-auto max-w-xl border border-[var(--line)] bg-white p-8 text-center sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--accent)]">Something went wrong</p>
          <h1 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">This page could not be loaded.</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Please try again. If the problem continues, the service may not be connected in this preview.</p>
          <Button type="button" className="mt-6" onClick={() => reset()}>Try again</Button>
        </div>
      </Container>
    </main>
  );
}
