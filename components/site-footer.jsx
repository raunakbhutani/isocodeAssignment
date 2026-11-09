import Link from "next/link";
import { Container } from "./ui";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-white py-10 sm:py-12">
      <Container className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.19em] text-[var(--ink)]">
            Company A
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">A more considered way to move.</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-[var(--muted)]">
          <Link href="/new-cars" className="hover:text-[var(--ink)]">New cars</Link>
          <Link href="/used-cars" className="hover:text-[var(--ink)]">Pre-owned</Link>
          <Link href="/book-test-drive" className="hover:text-[var(--ink)]">Test drives</Link>
          <span>© 2026 Company A</span>
        </div>
      </Container>
    </footer>
  );
}
