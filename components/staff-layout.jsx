import Link from "next/link";
import { Container, DemoNotice } from "./ui";

const staffLinks = [
  { href: "/consultant/leads", label: "Consultant" },
  { href: "/admin", label: "Admin" },
];

export default function StaffLayout({ title, description, children }) {
  return (
    <main className="flex-1 bg-[#f7f7f5] py-8 sm:py-12">
      <Container>
        <div className="mb-8 flex flex-col gap-5 border-b border-[var(--line)] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[var(--accent)]">
              DriveHub · Company A staff workspace
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p>
          </div>
          <nav className="flex gap-2" aria-label="Staff navigation">
            {staffLinks.map((link) => (
              <Link key={link.href} href={link.href} className="border border-[var(--line)] bg-white px-4 py-3 text-xs text-[var(--ink)] hover:border-[var(--accent)]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mb-6">
          <DemoNotice>Seeded accounts, showrooms, slots, and sample leads are assumed demo data. New bookings and lead updates are saved to the configured database. No external messages are sent.</DemoNotice>
        </div>
        {children}
      </Container>
    </main>
  );
}
