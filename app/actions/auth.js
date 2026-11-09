"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128).refine((password) => Buffer.byteLength(password, "utf8") <= 72),
});

export async function registerBuyer(_previousState, formData) {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid name, email, and password (12–72 UTF-8 bytes)." };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "BUYER",
      },
      select: { id: true },
    });
  } catch (error) {
    if (error?.code === "P2002") return { error: "An account with that email already exists." };
    throw error;
  }
  return { success: "Account created. You can now sign in." };
}
