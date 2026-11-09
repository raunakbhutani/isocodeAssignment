import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!["CONSULTANT", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Consultant access required." }, { status: 403 });
  }

  const leads = await prisma.lead.findMany({
    where: user.role === "ADMIN"
      ? {}
      : { assignedConsultant: { userId: user.id, isActive: true } },
    select: {
      id: true,
      reference: true,
      customerName: true,
      email: true,
      phone: true,
      status: true,
      source: true,
      receivedAt: true,
      vehicle: { select: { stockId: true } },
    },
    orderBy: { receivedAt: "desc" },
  });
  return NextResponse.json({ leads });
}
