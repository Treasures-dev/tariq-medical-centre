import { z } from "zod";

export const pharmacySchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().optional(), // slug auto-generated, optional for client
  sku: z.string().optional(),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  unit: z.string().min(1).optional(),
  description: z.string().optional(),
  usage: z.string().optional(),
  ingredient: z.string().optional(),
  expiry: z.string().optional(),
  mgf: z.string().optional(),
  images: z.array(z.string().min(1)).optional(),
});

export type PharmacyInput = z.infer<typeof pharmacySchema>;
