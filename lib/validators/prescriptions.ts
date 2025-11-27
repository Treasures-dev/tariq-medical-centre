import { z } from "zod";

const medicineSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().optional(),
  qty: z.number().int().min(1).optional().default(1),
  notes: z.string().optional(),
});

export const prescriptionSchema = z.object({
  patientName: z.string().min(1),
  patientPhone: z.string().optional(),
  doctorId: z.string().optional(),
  medicines: z.array(medicineSchema).min(1),
  notes: z.string().optional(),
  attachments: z.array(z.string().min(1)).optional(), // image/pdf URLs as strings
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
