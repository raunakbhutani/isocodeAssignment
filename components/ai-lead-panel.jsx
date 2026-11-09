"use client";

import { useState } from "react";
import { InfoNotice } from "./ui";
import { Badge, Button, Card } from "./ui/primitives";

export default function AiLeadPanel({ summary, firstReply }) {
  // Edits and approval status stay in this browser session; no message is sent or saved.
  const [draft, setDraft] = useState(firstReply);
  const [approved, setApproved] = useState(false);

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">AI buyer summary</p>
            <h2 className="mt-2 text-lg font-medium text-[var(--ink)]">Context at a glance</h2>
          </div>
          <Badge tone="warning">Placeholder · not Gemini</Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{summary}</p>
        <p className="mt-4 text-[10px] leading-5 text-[var(--muted)]">
          This is static sample copy. Gemini is not configured and no buyer message was supplied.
        </p>
      </Card>

      <Card className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">First-reply draft</p>
            <h2 className="mt-2 text-lg font-medium text-[var(--ink)]">Review before sending</h2>
          </div>
          {approved && <Badge tone="success">Approved in preview</Badge>}
        </div>
        <label htmlFor="reply-draft" className="sr-only">Edit first reply draft</label>
        <textarea
          id="reply-draft"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setApproved(false);
          }}
          className="mt-4 min-h-36 w-full resize-y border border-[var(--line)] p-4 text-sm leading-6 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
        <InfoNotice title="Local preview only:">
          Editing and approving here does not save to a lead record or send a reply.
        </InfoNotice>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" onClick={() => setApproved(true)} disabled={!draft.trim()}>
            Approve draft locally
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDraft(firstReply);
              setApproved(false);
            }}
          >
            Restore example
          </Button>
        </div>
        <p className="mt-3 min-h-4 text-xs text-[var(--muted)]" aria-live="polite">
          {approved ? "Marked approved in this preview only." : "Draft is not approved or sent."}
        </p>
      </Card>
    </div>
  );
}
