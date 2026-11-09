import { requirePageRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import ConsentPreferenceForm from "@/components/consent-preference-form";

export default async function ConsentSettingsPage() {
  const user = await requirePageRole("BUYER");
  const latestPreference = await prisma.consentRecord.findFirst({
    where: { userId: user.id, type: "MARKETING" },
    select: { granted: true, recordedAt: true },
    orderBy: { recordedAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-14 sm:px-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Buyer settings</p>
      <h1 className="mt-3 text-3xl font-semibold">Communication preferences</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        Optional marketing consent is stored as a dated record. Service-related replies to enquiries are separate.
      </p>
      <section className="mt-8 border border-[var(--line)] bg-white p-5 sm:p-8">
        <p className="text-sm text-[var(--ink)]">
          Current preference: <strong>{latestPreference?.granted ? "Marketing allowed" : "Marketing not allowed"}</strong>
        </p>
        {latestPreference && (
          <p className="mt-1 text-xs text-[var(--muted)]">
            Last updated {latestPreference.recordedAt.toLocaleString("en-IN")}
          </p>
        )}
        <ConsentPreferenceForm currentPreference={latestPreference?.granted ?? false} />
      </section>
    </main>
  );
}
