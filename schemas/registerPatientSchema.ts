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

  mrn: z.string().max(10, "MRN is too long").optional(),

  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => (!val.includes("+") && val.replace(/\D/g, "").length === 10 || (val.includes("+") && val.replace(/\D/g, "").length === 12)),
      "Please provide a valid phone number"
    ),

  email: z.string().email("Invalid email address").optional().or(z.literal("")),

  doctor: z.string().optional().or(z.literal("")).nullable(),

  gender: z.enum(["Male", "Female"], {
    message: "Gender is mandatory",
  }),

  dateOfBirth: z.string().optional().or(z.literal("")),
  age: z.union([z.string(), z.number()]).optional(),

  month: z.union([z.string(), z.number()]).optional(),

  conditions: z.array(z.string().max(100)).optional(),

  blood: z.enum([...BLOOD_GROUPS]).optional(),

  weight: z.union([z.literal(""), z.coerce.number()])
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),



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

  addressLine1: z.string().max(500).optional(),
  addressLine2: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pinCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  address: z.string().max(500).optional(),



  notes: z.string().max(2000).optional(),
});

export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;
export type RegisterPatientSchema = z.input<typeof registerPatientSchema>;

export default registerPatientSchema;
