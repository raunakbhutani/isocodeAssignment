"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/new-cars", label: "New cars" },
  { href: "/used-cars", label: "Used cars" },
  { href: "/#showrooms", label: "Our locations" },
];

export default function SiteHeader() {
  // This state only opens and closes the mobile navigation menu.
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-20 border-b border-[var(--line)] bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="DriveHub home"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center bg-[var(--accent)] text-xs font-bold tracking-widest text-white">
            D
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.19em] text-[var(--ink)]">DriveHub</span>
            <span className="mt-0.5 block text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">Company A · Brand X</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <Link href="/book-test-drive" className="nav-link text-xs">Test drive</Link>
          <Link href="/consultant/leads" className="nav-link text-xs">
            Consultant
          </Link>
          <Link href="/admin" className="nav-link text-xs">
            Admin
          </Link>
          <Link
            href="/new-cars"
            className="inline-flex h-11 items-center justify-center bg-[var(--ink)] px-5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent)]"
          >
            Browse stock
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center border border-[var(--line)] text-xl text-[var(--ink)] md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav className="absolute left-0 right-0 top-full border-b border-[var(--line)] bg-white px-5 py-5 shadow-lg md:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1320px] flex-col">
            {[...links, { href: "/book-test-drive", label: "Book a test drive" }, { href: "/consultant/leads", label: "Consultant dashboard" }, { href: "/admin", label: "Admin dashboard" }].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-b border-[var(--line)] py-4 text-sm text-[var(--ink)] last:border-0"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
