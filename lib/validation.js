import { z } from "zod";

export const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
export const phoneSchema = z.string().trim().regex(/^[+()\d -]{8,20}$/);

export const leadInputSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema,
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  vehicleStockId: z.string().trim().min(1).max(40).optional().or(z.literal("")),
  showroomId: z.string().cuid().optional().or(z.literal("")),
  contactConsent: z.literal(true),
  marketingConsent: z.boolean().optional(),
});
