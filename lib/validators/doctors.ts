// src/lib/validators/doctor.ts
import { z } from "zod";

export const availabilitySlot = z.object({
  day: z.enum(["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]),
  from: z.string().regex(/^\d{2}:\d{2}$/, "from must be HH:MM"),
  to: z.string().regex(/^\d{2}:\d{2}$/, "to must be HH:MM"),
  telehealth: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

const serviceSchemaZ = z.object({
  name: z.string().min(1, "Service name required"),
  price: z.number().min(0, "Price must be >= 0"),
});

export const doctorSchema = z.object({
  name: z.string().min(2, "Name required"),
  _id:z.string().optional(),
  qualifications: z.array(z.string()).optional().default([]),
  services: z.array(serviceSchemaZ).optional().default([]),
  email: z.string().email("Invalid email"),
  role: z.enum(["user","doctor","admin"]).default("doctor"),
  phone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  dept: z.string().optional().transform(val => val?.trim() || undefined),
  specialty: z.string().optional().nullable(),
  availability: z.array(availabilitySlot).optional(),
  avatar: z.string().optional().nullable(),

});

export type DoctorInput = z.infer<typeof doctorSchema>;


