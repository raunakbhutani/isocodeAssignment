import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET(_request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!["CONSULTANT", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Consultant access required." }, { status: 403 });
  }
  const { id } = await params;
  const lead = await prisma.lead.findFirst({
    where: {
      id,
      ...(user.role === "ADMIN"
        ? {}
        : { assignedConsultant: { userId: user.id, isActive: true } }),
    },
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
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  return NextResponse.json({ lead });
}
