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
    .transform((val) => {
      /* This code snippet is a transformation function for formatting phone numbers. */
      if (val.length === 10) {
        return `${val.slice(0, 5)} ${val.slice(5)}`;
      } else {
        return `${val.slice(0, 3)} ${val.slice(3, 7)} ${val.slice(7)}`;
      }
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
    .transform((val) => val?.trim() || "")
    .transform((val) => {
      if (!val) return val;

      if (val.length === 10) {
        return `${val.slice(0, 5)} ${val.slice(5)}`;
      } else {
        return `${val.slice(0, 3)} ${val.slice(3, 7)} ${val.slice(7)}`;
      }
    }),

  address: z.string().max(500).optional(),

  notes: z.string().max(2000).optional(),
});

export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;

export default registerPatientSchema;
