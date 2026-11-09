import "server-only";
import { prisma } from "@/lib/prisma";
import { generateLeadAssistance } from "@/lib/gemini-lead-assistance";

const timelineLabels = {
  IMMEDIATELY: "As soon as possible",
  WITHIN_1_MONTH: "Within one month",
  ONE_TO_THREE_MONTHS: "One to three months",
  THREE_TO_SIX_MONTHS: "Three to six months",
  JUST_EXPLORING: "Just exploring",
};

function formatBudget(value) {
  return value == null
    ? "Not provided"
    : `₹${value.toLocaleString("en-IN")}`;
}

function summarizeTrustedLeadData(lead, generated) {
  return {
    customerRequirements: generated.customerRequirements,
    interestedModelAndVariant: lead.variant
      ? `${lead.variant.model.name} ${lead.variant.name}`
      : "Not specified",
    budget: formatBudget(lead.budgetInr),
    purchaseTimeline: timelineLabels[lead.purchaseTimeline] ?? "Not provided",
    preferredShowroom: lead.requestedShowroom?.name ?? "Not specified",
    importantQuestionsOrConcerns: generated.importantQuestionsOrConcerns,
    consultantSummary: generated.conciseSummary,
  };
}

export async function generateAndSaveLeadAssistance(leadId) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        message: true,
        budgetInr: true,
        purchaseTimeline: true,
        variant: {
          select: {
            name: true,
            model: { select: { name: true } },
          },
        },
        requestedShowroom: { select: { name: true } },
      },
    });
    if (!lead) {
      return {
        status: "UNAVAILABLE",
        message: "Lead details could not be loaded for AI assistance. Write a summary and reply manually.",
      };
    }

    const result = await generateLeadAssistance({
      interestedModelAndVariant: lead.variant
        ? `${lead.variant.model.name} ${lead.variant.name}`
        : "Not specified",
      budget: formatBudget(lead.budgetInr),
      purchaseTimeline: timelineLabels[lead.purchaseTimeline] ?? "Not provided",
      preferredShowroom: lead.requestedShowroom?.name ?? "Not specified",
      buyerMessage: lead.message || "No additional message supplied.",
    });
    const summaryData = result.ok ? summarizeTrustedLeadData(lead, result.data) : null;

    await prisma.leadAiDraft.create({
      data: {
        leadId,
        summary: summaryData?.consultantSummary ?? "",
        summaryData: summaryData ?? undefined,
        replyDraft: result.ok ? result.data.firstReplyDraft : "",
        model: result.ok ? result.model : result.reason,
        status: result.status,
        statusMessage: result.ok ? null : result.message,
      },
      select: { id: true },
    });

    return {
      status: result.status,
      message: result.ok ? "AI summary and reply draft are ready for consultant review." : result.message,
    };
  } catch {
    console.warn("Lead AI assistance could not be generated or saved.");
    return {
      status: "UNAVAILABLE",
      message: "AI assistance could not be saved. Write a summary and reply manually.",
    };
  }
}
