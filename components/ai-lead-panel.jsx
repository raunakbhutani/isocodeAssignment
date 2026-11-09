"use client";

import { useActionState } from "react";
import { approveLeadDraft, saveLeadDraft } from "@/app/actions/consultant";
import { InfoNotice } from "./ui";
import { Badge, Card } from "./ui/primitives";

const initialState = { error: "", success: "", draftId: "" };

export default function AiLeadPanel({ leadId, draft }) {
  const [saveState, saveAction, isSaving] = useActionState(saveLeadDraft, initialState);
  const [approvalState, approveAction, isApproving] = useActionState(approveLeadDraft, initialState);
  const draftId = saveState.draftId || draft?.id || "";
  const summary = draft?.summary ?? "No AI summary has been generated. Gemini is not configured.";
  const reply = draft?.replyDraft ?? "";

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Buyer summary</p>
            <h2 className="mt-2 text-lg font-medium text-[var(--ink)]">Context at a glance</h2>
          </div>
          <Badge tone="warning">Gemini not connected</Badge>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{summary}</p>
        <p className="mt-4 text-[10px] leading-5 text-[var(--muted)]">
          Summaries and drafts must be reviewed by a consultant. Approving a draft does not send it.
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
        <form action={saveAction} className="mt-4 space-y-4">
          <input type="hidden" name="leadId" value={leadId} />
          <label className="form-label">
            Summary
            <textarea
              name="summary"
              defaultValue={summary}
              maxLength={3000}
              required
              className="form-input min-h-24 resize-y py-3"
            />
          </label>
          <label className="form-label">
            Reply draft
            <textarea
              name="replyDraft"
              defaultValue={reply}
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
            {isSaving ? "Saving..." : "Save draft"}
          </button>
        </form>
        {(saveState.error || saveState.success) && (
          <p role={saveState.error ? "alert" : "status"} className="mt-3 text-xs text-[var(--muted)]">
            {saveState.error || saveState.success}
          </p>
        )}
        {draftId && (
          <form action={approveAction} className="mt-4">
            <input type="hidden" name="leadId" value={leadId} />
            <input type="hidden" name="draftId" value={draftId} />
            <button
              className="min-h-11 border border-[var(--line)] bg-white px-5 text-sm font-medium text-[var(--ink)] hover:border-[var(--ink)] disabled:opacity-50"
              type="submit"
              disabled={isApproving}
            >
              {isApproving ? "Approving..." : "Approve draft"}
            </button>
          </form>
        )}
        {(approvalState.error || approvalState.success) && (
          <p role={approvalState.error ? "alert" : "status"} className="mt-3 text-xs text-[var(--muted)]">
            {approvalState.error || approvalState.success}
          </p>
        )}
        <div className="mt-4">
          <InfoNotice title="No messages are sent:">
            Saved and approved drafts remain in the lead record for consultant review. Sending needs a separate confirmed messaging integration.
          </InfoNotice>
        </div>
      </Card>
    </div>
  );
}
