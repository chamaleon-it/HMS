import { z } from "zod";

export const updateSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers")
    .optional(),
  phoneNumber: z.string().trim().toLowerCase(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  hospital: z.string().trim().nullable(),
  specialization: z.string().trim().nullable(),
  profilePic: z.string().trim().nullable(),
  signature: z.string().trim().nullable(),
  availability: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      days: z.array(z.string()).optional(),
      rounds: z
        .array(
          z.object({ label: z.string(), start: z.string(), end: z.string() })
        )
        .optional(),
    })
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
