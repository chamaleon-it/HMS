import { z } from "zod";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const registerPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),

  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine((v) => !v || /^\+?\d{7,15}$/.test(v), {
      message: "Invalid phone number",
    }),

  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email address is required"),

  gender: z.enum(["Male", "Female", "Other"]),

  age: z.coerce.number().int().min(0).max(120),

  condition: z.string().max(100).optional(),

  blood: z.enum([...BLOOD_GROUPS]).optional(),

  allergies: z.string().max(500).optional(),

  address: z.string().max(500).optional(),

  notes: z.string().max(2000).optional(),
});

export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;

export default registerPatientSchema;
