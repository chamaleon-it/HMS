import { z } from "zod";

export const pharmacyItemAddSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, { error: "Name must be at least 2 characters" })
    .max(120, { error: "Name must be at most 120 characters" })
    .transform((s) => s.trim()),

  generic: z
    .string({ error: "Generic name is required" })
    .max(120, { error: "Generic name must be at most 120 characters" })
    .transform((s) => s.trim()).optional(),

  hsnCode: z
    .string({ error: "HSN code is required" })
    // .regex(/^\d{4,8}$/, { error: "HSN code must be 4–8 digits" })
    .transform((s) => s.trim()),

  sku: z
    .string({ error: "SKU is required" })
    .regex(/^[A-Za-z0-9-_]+$/, {
      error: "SKU may contain only letters, numbers, hyphens, and underscores",
    })
    .max(64, { error: "SKU must be at most 64 characters" })
    .transform((s) => s.trim().toUpperCase()),

  category: z
    .string({ error: "Category is required" })
    .min(2, { error: "Category must be at least 2 characters" })
    .transform((s) => s.trim()),

  supplier: z
    .string({ error: "Supplier is required" })
    .transform((s) => s.trim()),

  manufacturer: z
    .string({ error: "Supplier is required" })
    .transform((s) => s.trim()),

  purchasePrice: z.coerce
    .number({ error: "Purchase price must be a number" })
    .min(1, { error: "Purchase price cannot be zero or below" }),

  unitPrice: z.coerce
    .number({ error: "Unit price must be a number" })
    .min(1, { error: "Unit price cannot be zero or below" }),

  openingStockQuantity: z.coerce
    .number({ error: "Opening stock must be a number" })
    .int({ error: "Opening stock must be an integer" })
    .min(1, { error: "Opening stock cannot be zero or below" }),

  quantity: z.coerce
    .number({ error: "Quantity must be a number" })
    .int({ error: "Quantity must be an integer" })
    .min(1, { error: "Quantity cannot be zero or below" }),

  // Zod v4 provides z.iso.date() for ISO date strings
  expiryDate: z.string({ error: "Expiry date is required" }),
  // iso.date({
  //   error: "Expiry date must be an ISO date (YYYY-MM-DD)",
  // }),

  batchNumber: z.string({ error: "Batch number is required" }).optional(),

  rackLocation: z.string({ error: "Rack location is required" }).optional(),

  packing: z.coerce
    .number({ error: "Packing must be a number" })
    .int({ error: "Packing must be an integer" })
    .optional(),

  gst: z.coerce
    .number({ error: "GST must be a number" })
    .max(100, { error: "GST cannot be above 100" })
    .optional(),

  status: z.enum(["Active", "Inactive"], {
    error: "Status must be 'Active' or 'Inactive'",
  }),
});

export type PharmacyItemAddInput = z.infer<typeof pharmacyItemAddSchema>;
