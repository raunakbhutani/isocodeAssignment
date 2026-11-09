import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user?.isActive) return null;
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be signed in to do that.");
  return user;
}

export async function requireRole(...roles) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error("You do not have permission to do that.");
  }
  return user;
}

export async function requirePageRole(...roles) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export async function requireLeadAccess(leadId) {
  const user = await requireUser();

  if (user.role === "ADMIN") return user;
  if (user.role !== "CONSULTANT") {
    throw new Error("You do not have permission to view this lead.");
  }

  const consultant = await prisma.consultant.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      leads: { some: { id: leadId } },
    },
    select: { id: true },
  });
  if (!consultant) throw new Error("You do not have access to this lead.");

  return user;
}
