import { z } from "zod";

export const loginSchema = z
  .object({
    usernameOrEmail: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Enter a valid email address or username"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/\d/, "Must contain at least one number")
      .regex(/[^\w\s]/, "Must contain at least one symbol"),
   
  })

export type LoginInput = z.infer<typeof loginSchema>;
