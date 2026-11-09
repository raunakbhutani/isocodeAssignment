import { z } from "zod";

export const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
export const phoneSchema = z.string().trim().regex(/^[+()\d -]{8,20}$/);

const budgetSchema = z.preprocess(
  (value) => value === "" || value == null ? undefined : value,
  z.coerce.number().int().min(0).max(2_000_000_000).optional(),
);

export const leadInputSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema,
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  vehicleStockId: z.string().trim().min(1).max(40),
  showroomId: z.string().cuid(),
  budgetInr: budgetSchema,
  purchaseTimeline: z.enum([
    "IMMEDIATELY",
    "WITHIN_1_MONTH",
    "ONE_TO_THREE_MONTHS",
    "THREE_TO_SIX_MONTHS",
    "JUST_EXPLORING",
  ]).optional().or(z.literal("")),
  contactConsent: z.literal(true),
  marketingConsent: z.boolean().optional(),
});
