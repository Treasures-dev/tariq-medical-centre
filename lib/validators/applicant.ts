import z from "zod";

export const applicant = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    department: z.string().optional(),
    fileUrl: z.string().url(),
  });