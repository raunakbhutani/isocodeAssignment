"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireLeadAccess, requireRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { canReassignLead } from "@/lib/lead-assignment";

const leadIdSchema = z.string().min(1).max(64);
const statusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "NEGOTIATION",
  "TEST_DRIVE_SCHEDULED",
  "CONVERTED",
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
      assignedConsultantId: true,
      receivedAt: true,
      assignedAt: true,
      firstRespondedAt: true,
      requestedShowroom: { select: { id: true, name: true } },
      variant: { select: { name: true, model: { select: { name: true } } } },
      vehicle: { select: { stockId: true } },
      assignedConsultant: { select: { user: { select: { name: true } } } },
      testDriveBookings: {
        where: { status: "CONFIRMED" },
        select: {
          status: true,
          slot: {
            select: {
              startsAt: true,
              showroom: { select: { name: true } },
              demoVehicle: {
                select: {
                  stockId: true,
                  variant: { select: { name: true, model: { select: { name: true } } } },
                },
              },
            },
          },
        },
        take: 1,
      },
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
      budgetInr: true,
      purchaseTimeline: true,
      assignedConsultantId: true,
      assignedAt: true,
      requestedShowroomId: true,
      requestedShowroom: { select: { name: true, city: { select: { name: true } } } },
      variant: { select: { id: true, name: true, model: { select: { id: true, name: true } } } },
      vehicle: { select: { stockId: true, type: true } },
      assignedConsultant: { select: { id: true, user: { select: { name: true } } } },
      notifications: {
        select: {
          id: true,
          type: true,
          message: true,
          createdAt: true,
          recipientConsultant: { select: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      testDriveBookings: {
        select: {
          id: true,
          status: true,
          slot: {
            select: {
              startsAt: true,
              endsAt: true,
              showroom: { select: { name: true } },
              demoVehicle: {
                select: {
                  stockId: true,
                  variant: { select: { name: true, model: { select: { name: true } } } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
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

export async function getReassignableConsultants(leadId) {
  const parsedId = leadIdSchema.safeParse(leadId);
  if (!parsedId.success) throw new Error("Invalid lead reference.");
  await requireLeadAccess(parsedId.data);
  const lead = await prisma.lead.findUnique({
    where: { id: parsedId.data },
    select: {
      requestedShowroomId: true,
      variant: { select: { modelId: true } },
    },
  });
  if (!lead) throw new Error("Lead not found.");

  return prisma.consultant.findMany({
    where: {
      isActive: true,
      ...(lead.requestedShowroomId ? { showroomId: lead.requestedShowroomId } : {}),
      ...(lead.variant ? { models: { some: { modelId: lead.variant.modelId } } } : {}),
    },
    select: {
      id: true,
      showroomId: true,
      user: { select: { name: true } },
      models: { select: { modelId: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export async function reassignLead(_previousState, formData) {
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
        select: {
          id: true,
          assignedConsultantId: true,
          requestedShowroomId: true,
          variant: { select: { modelId: true } },
        },
      }),
      tx.consultant.findFirst({
        where: { id: parsed.data.consultantId, isActive: true },
        select: {
          id: true,
          showroomId: true,
          models: { select: { modelId: true } },
        },
      }),
    ]);
    if (!lead || !target) throw new Error("Lead or active consultant not found.");

    let actorContext = { role: actor.role };
    if (actor.role === "CONSULTANT") {
      const current = await tx.consultant.findFirst({
        where: { userId: actor.id, isActive: true },
        select: { id: true, showroomId: true },
      });
      actorContext = { ...actorContext, consultantId: current?.id, showroomId: current?.showroomId };
    }
    const leadContext = {
      assignedConsultantId: lead.assignedConsultantId,
      requestedShowroomId: lead.requestedShowroomId,
      modelId: lead.variant?.modelId,
    };
    const targetContext = {
      isActive: true,
      showroomId: target.showroomId,
      modelIds: target.models.map((model) => model.modelId),
    };
    if (!canReassignLead(actorContext, leadContext, targetContext)) {
      throw new Error("You may reassign only to an eligible consultant for this showroom and model.");
    }

    await tx.lead.update({
      where: { id: lead.id },
      data: {
        assignedConsultantId: target.id,
        assignedAt: new Date(),
        assignments: {
          create: {
            consultantId: target.id,
            assignedById: actor.id,
            showroomId: lead.requestedShowroomId,
            modelId: lead.variant?.modelId,
          },
        },
        notifications: {
          create: {
            recipientConsultantId: target.id,
            type: "LEAD_REASSIGNED",
            message: "Lead reassigned to you. Internal acknowledgement only; no external message was sent.",
          },
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
  return { success: "Lead reassigned. An internal acknowledgement was recorded; no external message was sent." };
}
