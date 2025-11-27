import { z } from "zod";


const planItem = z.object({
  step: z.string().min(1),
  date: z.string().optional(), // ISO date string (optional)
});

export const ongoingTreatmentSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  plan: z.array(planItem).optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
});

export type OngoingTreatmentInput = z.infer<typeof ongoingTreatmentSchema>;
