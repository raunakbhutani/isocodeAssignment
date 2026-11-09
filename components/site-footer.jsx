"use client";

import Link from "next/link";
import { Container } from "./ui";
import { useBuyerLanguage } from "./buyer-language-provider";

export default function SiteFooter() {
  const { t } = useBuyerLanguage();
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-white py-10 sm:py-12">
      <Container className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.19em] text-[var(--ink)]">
            DriveHub
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">A working product name for Company A’s Brand X dealership.</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Lucknow, Uttar Pradesh</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-[var(--muted)]">
          <Link href="/new-cars" className="hover:text-[var(--ink)]">{t("New cars")}</Link>
          <Link href="/used-cars" className="hover:text-[var(--ink)]">{t("Used cars")}</Link>
          <Link href="/book-test-drive" className="hover:text-[var(--ink)]">{t("Test drive")}</Link>
          <Link href="/consultant/leads" className="hover:text-[var(--ink)]">{t("Consultant")}</Link>
          <Link href="/admin" className="hover:text-[var(--ink)]">{t("Admin")}</Link>
          <span>© 2026 DriveHub · Company A</span>
        </div>
      </Container>
    </footer>
  );
}
