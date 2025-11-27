import { z } from "zod";

export const appointmentSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1, "Patient name is required"),
  phone: z.string().min(7, "Phone is required"),
  email: z.string().optional() ,
  doctorId: z.string().min(1, "Doctor is required"),
  type: z.enum(["online", "walkin"]),
  date: z.string(), // ISO date
  timeSlot: z.string().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(), 
});

export const prescriptionSchema = z.object({
  medications: z.string().min(1, "Medications are required"),
  notes: z.string().optional(),
});

export const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
export type StatusInput = z.infer<typeof statusSchema>;
