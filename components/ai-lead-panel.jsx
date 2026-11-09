"use client";

import { useActionState, useState } from "react";
import { approveLeadDraft, saveLeadDraft } from "@/app/actions/consultant";
import { InfoNotice } from "./ui";
import { Badge, Card } from "./ui/primitives";

const initialState = { error: "", success: "", draftId: "", savedVersion: 0 };

function assistanceLabel(status) {
  if (status === "GENERATED") return "AI generated · review required";
  if (status === "UNAVAILABLE") return "AI unavailable";
  return "Manual assistance";
}

export default function AiLeadPanel({ leadId, draft }) {
  const [saveState, saveAction, isSaving] = useActionState(saveLeadDraft, initialState);
  const [approvalState, approveAction, isApproving] = useActionState(approveLeadDraft, initialState);
  const [editVersion, setEditVersion] = useState(0);
  const draftId = saveState.draftId || draft?.id || "";
  const isEdited = editVersion !== (saveState.savedVersion ?? 0);
  const summaryData = draft?.status === "GENERATED" ? draft.summaryData : null;
  const canApprove = Boolean(draft?.summary && draft?.replyDraft) || Boolean(saveState.success);

  const summarySections = summaryData
    ? [
        ["Customer requirements", summaryData.customerRequirements],
        ["Interested model and variant", summaryData.interestedModelAndVariant],
        ["Budget", summaryData.budget],
        ["Purchase timeline", summaryData.purchaseTimeline],
        ["Preferred showroom", summaryData.preferredShowroom],
        ["Questions or concerns", summaryData.importantQuestionsOrConcerns?.join("\n") || "None identified"],
      ]
    : [];

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Buyer summary</p>
            <h2 className="mt-2 text-lg font-medium text-[var(--ink)]">Context at a glance</h2>
          </div>
          <Badge tone={draft?.status === "GENERATED" ? "success" : "warning"}>
            {assistanceLabel(draft?.status)}
          </Badge>
        </div>
        {summarySections.length > 0 ? (
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {summarySections.map(([label, value]) => (
              <div key={label} className="border-t border-[var(--line)] pt-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--ink)]">{value}</dd>
              </div>
            ))}
            <div className="border-t border-[var(--line)] pt-3 sm:col-span-2">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Consultant summary</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--ink)]">{summaryData.consultantSummary}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            {draft?.statusMessage ?? "No AI summary is saved. You can write one manually below."}
          </p>
        )}
        <p className="mt-4 text-[10px] leading-5 text-[var(--muted)]">
          AI uses the vehicle interest and enquiry details only. It does not set prices or send messages.
        </p>
      </Card>

      <Card className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">First-reply draft</p>
            <h2 className="mt-2 text-lg font-medium text-[var(--ink)]">Review before sending</h2>
          </div>
          {draft?.reviewedAt && <Badge tone="success">Approved</Badge>}
        </div>
        <form action={saveAction} className="mt-4 space-y-4" onChange={() => setEditVersion((version) => version + 1)}>
          <input type="hidden" name="leadId" value={leadId} />
          <input type="hidden" name="editVersion" value={editVersion} />
          <label className="form-label">
            Consultant summary (editable)
            <textarea
              name="summary"
              defaultValue={draft?.summary ?? ""}
              placeholder="Write the buyer's needs and the next step for the consultant."
              maxLength={3000}
              required
              className="form-input min-h-24 resize-y py-3"
            />
          </label>
          <label className="form-label">
            Reply draft (editable)
            <textarea
              name="replyDraft"
              defaultValue={draft?.replyDraft ?? ""}
              placeholder="Write a professional reply and a suitable next step."
              maxLength={3000}
              required
              className="form-input min-h-36 resize-y py-3"
            />
          </label>
          <button
            className="min-h-11 bg-[var(--ink)] px-5 text-sm font-medium text-white hover:bg-[var(--accent)] disabled:opacity-50"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save edited draft"}
          </button>
        </form>
        {(saveState.error || saveState.success) && (
          <p role={saveState.error ? "alert" : "status"} className="mt-3 text-xs text-[var(--muted)]">
            {saveState.error || saveState.success}
          </p>
        )}
        {draftId && canApprove && (
          <form action={approveAction} className="mt-4">
            <input type="hidden" name="leadId" value={leadId} />
            <input type="hidden" name="draftId" value={draftId} />
            <button
              className="min-h-11 border border-[var(--line)] bg-white px-5 text-sm font-medium text-[var(--ink)] hover:border-[var(--ink)] disabled:opacity-50"
              type="submit"
              disabled={isApproving || isEdited}
            >
              {isApproving ? "Approving..." : "Approve reviewed draft"}
            </button>
            {isEdited && <p className="mt-2 text-xs text-[var(--muted)]">Save your edits before approving this draft.</p>}
          </form>
        )}
        {(approvalState.error || approvalState.success) && (
          <p role={approvalState.error ? "alert" : "status"} className="mt-3 text-xs text-[var(--muted)]">
            {approvalState.error || approvalState.success}
          </p>
        )}
        <div className="mt-4">
          <InfoNotice title="Approval does not send a message:">
            A consultant must explicitly approve the reviewed draft. Sending is not integrated; no email, SMS, or WhatsApp message is sent.
          </InfoNotice>
        </div>
      </Card>
    </div>
  );
}
