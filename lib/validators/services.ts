import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string().min(1, "Service title is required"),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  price: z.number().min(0, "Price cannot be negative"),
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  description: z.string().optional(),
  installmentAvailable: z.boolean().default(false),
  installmentOptions: z
    .object({
      parts: z.number().optional(),
      intervalDays: z.number().optional(),
      firstPaymentPercent: z.number().optional(),
    })
    .optional(),
  image: z.string().optional(),

  // --- Offer fields ---
  onOffer: z.boolean().default(false),
  offerPrice: z.number().nonnegative().optional(),
  offerEnds: z.coerce.date().optional().nullable(),
});

// cross-field refinement: if onOffer true, offerPrice must be present and less than price
export const serviceSchemaWithRefinement = serviceSchema.refine(
  (data) => {
    if (!data.onOffer) return true;
    if (typeof data.offerPrice !== "number") return false;
    return data.offerPrice < data.price;
  },
  {
    message: "When 'onOffer' is true, offerPrice is required and must be less than base price.",
    path: ["offerPrice"],
  }
);

export type ServiceInput = z.infer<typeof serviceSchemaWithRefinement>;
