import Link from "next/link";

export function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, light = false }) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.2em] ${
        light ? "text-white/70" : "text-[var(--accent)]"
      }`}
    >
      {children}
    </p>
  );
}

export function ButtonLink({ href, children, variant = "dark", className = "" }) {
  const styles =
    variant === "light"
      ? "border border-white/40 text-white hover:bg-white hover:text-[var(--ink)]"
      : variant === "outline" || variant === "secondary"
        ? "border border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]"
        : "bg-[var(--ink)] text-white hover:bg-[var(--accent)]";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-sm px-6 text-sm font-medium transition-colors ${styles} ${className}`}
    >
      {children}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}

export function DemoNotice({
  children = "Official sample inventory is from the brief. Additional demo records are assumptions; photographs are placeholders. Inventory and booking use the configured database.",
}) {
  return (
    <p className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
      <strong className="font-semibold">Demo data:</strong> {children}
    </p>
  );
}

export function InfoNotice({ title, children, tone = "neutral" }) {
  const colors = tone === "warning"
    ? "border-amber-200 bg-amber-50 text-amber-950"
    : "border-[var(--line)] bg-[#f7f7f5] text-[var(--muted)]";

  return (
    <div className={`border px-4 py-3 text-xs leading-5 ${colors}`}>
      {title && <strong className="mr-1 font-semibold text-[var(--ink)]">{title}</strong>}
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">
          {title}
        </h2>
        {description && <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
