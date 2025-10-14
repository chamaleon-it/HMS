import { z } from "zod";

export const createAppointmentSchema = z.object({
  patient: z.string().trim().min(1, "Patient  is required"),
  doctor: z.string().trim().min(1, "Select a doctor."),
  method: z.string().trim().min(1, "Select a method."),
  date: z.string().trim().min(1, "Pick a date and time."),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  type: z.string().optional(),
  isPaid: z.string().transform(value=>JSON.parse(value)),
});
