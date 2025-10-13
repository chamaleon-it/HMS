import { z } from "zod";

export const updateSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  phoneNumber: z.string().trim().toLowerCase(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  hospital: z.string().trim().nullable(),
  specialization: z.string().trim().nullable(),
  profilePic: z.string().trim().nullable(),
  signature: z.string().trim().nullable(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

