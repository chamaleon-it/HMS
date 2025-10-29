import { z } from "zod";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const registerPatientSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .transform((val) =>
      val
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    ),

  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine((v) => !v || /^\+?\d{7,15}$/.test(v), {
      message: "Invalid phone number",
    }),

  email: z.string().email("Invalid email address").optional().or(z.literal("")),

  doctor: z.string().trim().min(1, "Select a doctor."),

  gender: z.enum(["Male", "Female", "Other"]),

  dateOfBirth: z.string(),

  conditions: z.array(z.string().max(100)).optional(),

  blood: z.enum([...BLOOD_GROUPS]).optional(),

  allergies: z.string().max(500).optional(),

  insurance: z.string().max(100).optional(),

  insuranceValidity: z.string().max(40).optional(),

  uhid: z.string().max(500).optional(),

  emergencyContactNumber: z
    .string()
    .optional()
    .refine((v) => !v || /^\+?\d{7,15}$/.test(v), {
      message: "Invalid phone number",
    }),

  address: z.string().max(500).optional(),

  notes: z.string().max(2000).optional(),
});

export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;

export default registerPatientSchema;
