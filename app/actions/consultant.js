"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireLeadAccess, requireRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const leadIdSchema = z.string().min(1).max(64);
const statusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "TEST_DRIVE_SCHEDULED",
  "WON",
  "LOST",
]);

export async function getAssignedLeads() {
  const user = await requireRole("CONSULTANT", "ADMIN");
  return prisma.lead.findMany({
    where: user.role === "ADMIN"
      ? {}
      : { assignedConsultant: { userId: user.id, isActive: true } },
    select: {
      id: true,
      reference: true,
      customerName: true,
      phone: true,
      status: true,
      source: true,
      receivedAt: true,
      vehicle: { select: { stockId: true } },
      assignedConsultant: { select: { user: { select: { name: true } } } },
    },
    orderBy: { receivedAt: "desc" },
  });
}

export async function getLeadDetails(leadId) {
  const parsedId = leadIdSchema.safeParse(leadId);
  if (!parsedId.success) throw new Error("Invalid lead reference.");
  await requireLeadAccess(parsedId.data);
  return prisma.lead.findUnique({
    where: { id: parsedId.data },
    select: {
      id: true,
      reference: true,
      customerName: true,
      email: true,
      phone: true,
      message: true,
      status: true,
      source: true,
      receivedAt: true,
      firstRespondedAt: true,
      vehicle: { select: { stockId: true, type: true } },
      aiDrafts: {
        select: { id: true, summary: true, replyDraft: true, model: true, reviewedAt: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function updateLeadStatus(formData) {
  const parsed = z.object({
    leadId: leadIdSchema,
    status: statusSchema,
  }).safeParse({
    leadId: formData.get("leadId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Choose a valid lead status." };

  const user = await requireLeadAccess(parsed.data.leadId);
  await prisma.$transaction(async (tx) => {
    const current = await tx.lead.findUnique({
      where: { id: parsed.data.leadId },
      select: { status: true, firstRespondedAt: true },
    });
    const updated = await tx.lead.update({
      where: { id: parsed.data.leadId },
      data: {
        status: parsed.data.status,
        ...(parsed.data.status !== "NEW" && !current?.firstRespondedAt
          ? { firstRespondedAt: new Date() }
          : {}),
        ...(current?.status !== parsed.data.status ? { activities: {
          create: {
            actorUserId: user.id,
            type: "STATUS_CHANGE",
            details: `Status changed to ${parsed.data.status}.`,
          },
        } } : {}),
      },
      select: { id: true },
    });
    return updated;
  });
  revalidatePath("/consultant/leads");
  revalidatePath(`/consultant/leads/${parsed.data.leadId}`);
  return { success: "Lead status updated." };
}

export async function saveLeadDraft(_previousState, formData) {
  const parsed = z.object({
    leadId: leadIdSchema,
    summary: z.string().trim().min(1).max(3000),
    replyDraft: z.string().trim().min(1).max(3000),
  }).safeParse({
    leadId: formData.get("leadId"),
    summary: formData.get("summary"),
    replyDraft: formData.get("replyDraft"),
  });
  if (!parsed.success) return { error: "The summary and reply draft are required." };
  await requireLeadAccess(parsed.data.leadId);

  const draft = await prisma.leadAiDraft.create({
    data: {
      leadId: parsed.data.leadId,
      summary: parsed.data.summary,
      replyDraft: parsed.data.replyDraft,
      model: "manual",
    },
    select: { id: true },
  });
  revalidatePath(`/consultant/leads/${parsed.data.leadId}`);
  return { success: "Draft saved. No message was sent.", draftId: draft.id };
}

export async function approveLeadDraft(_previousState, formData) {
  const parsed = z.object({
    leadId: leadIdSchema,
    draftId: leadIdSchema,
  }).safeParse({
    leadId: formData.get("leadId"),
    draftId: formData.get("draftId"),
  });
  if (!parsed.success) return { error: "Invalid draft reference." };
  await requireLeadAccess(parsed.data.leadId);

  const updated = await prisma.leadAiDraft.updateMany({
    where: { id: parsed.data.draftId, leadId: parsed.data.leadId },
    data: { reviewedAt: new Date() },
  });
  if (updated.count !== 1) throw new Error("This draft does not belong to the selected lead.");
  revalidatePath(`/consultant/leads/${parsed.data.leadId}`);
  return { success: "Draft approved. It has not been sent to the buyer.", draftId: parsed.data.draftId };
}

export async function reassignLead(formData) {
  const parsed = z.object({
    leadId: leadIdSchema,
    consultantId: leadIdSchema,
  }).safeParse({
    leadId: formData.get("leadId"),
    consultantId: formData.get("consultantId"),
  });
  if (!parsed.success) return { error: "Choose a valid lead and consultant." };

  const actor = await requireRole("CONSULTANT", "ADMIN");
  await prisma.$transaction(async (tx) => {
    const [lead, target] = await Promise.all([
      tx.lead.findUnique({
        where: { id: parsed.data.leadId },
        select: { id: true, assignedConsultantId: true, requestedShowroomId: true },
      }),
      tx.consultant.findFirst({
        where: { id: parsed.data.consultantId, isActive: true },
        select: { id: true, showroomId: true },
      }),
    ]);
    if (!lead || !target) throw new Error("Lead or active consultant not found.");

    if (actor.role === "CONSULTANT") {
      const current = await tx.consultant.findFirst({
        where: { userId: actor.id, isActive: true },
        select: { id: true, showroomId: true },
      });
      if (!current || lead.assignedConsultantId !== current.id || current.showroomId !== target.showroomId) {
        throw new Error("Consultants may reassign only their own leads within their showroom.");
      }
    } else if (lead.requestedShowroomId && lead.requestedShowroomId !== target.showroomId) {
      throw new Error("The new consultant must belong to the lead's requested showroom.");
    }

    await tx.lead.update({
      where: { id: lead.id },
      data: {
        assignedConsultantId: target.id,
        assignedAt: new Date(),
        assignments: {
          create: { consultantId: target.id, assignedById: actor.id },
        },
        activities: {
          create: {
            actorUserId: actor.id,
            type: "ASSIGNMENT",
            details: "Lead reassigned to another consultant.",
          },
        },
      },
      select: { id: true },
    });
  });
  revalidatePath("/consultant/leads");
  revalidatePath(`/consultant/leads/${parsed.data.leadId}`);
  return { success: "Lead reassigned." };
}
