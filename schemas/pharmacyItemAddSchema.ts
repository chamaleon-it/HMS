import { z } from "zod";

/** Item master — pricing/supplier/packing belong on batches. */
export const pharmacyItemAddSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, { error: "Name must be at least 2 characters" })
    .max(120, { error: "Name must be at most 120 characters" })
    .transform((s) => s.trim()),

  generic: z
    .string({ error: "Generic name is required" })
    .max(120, { error: "Generic name must be at most 120 characters" })
    .transform((s) => s.trim())
    .optional(),

  hsnCode: z
    .string({ error: "HSN code is required" })
    .transform((s) => s.trim()),

  category: z
    .string({ error: "Category is required" })
    .min(2, { error: "Category must be at least 2 characters" })
    .transform((s) => s.trim()),

  manufacturer: z
    .string({ error: "Manufacturer is required" })
    .transform((s) => s.trim())
    .optional(),

  /** Opening-batch qty when batchNumber is supplied (not Item.openingStockQuantity). */
  openingStockQuantity: z.coerce
    .number({ error: "Current stock must be a number" })
    .int({ error: "Current stock must be an integer" })
    .optional(),

  quantity: z.coerce
    .number({ error: "Quantity must be a number" })
    .int({ error: "Quantity must be an integer" })
    .optional(),

  expiryDate: z.string().optional(),

  batchNumber: z.string({ error: "Batch number is required" }).optional(),

  rackLocation: z.string({ error: "Rack location is required" }).optional(),

  status: z.enum(["Active", "Inactive"], {
    error: "Status must be 'Active' or 'Inactive'",
  }),
});

export type PharmacyItemAddInput = z.infer<typeof pharmacyItemAddSchema>;
