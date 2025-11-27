import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  description: z.string().optional(),
  doctors: z.array(z.string()).optional(),
  photo:z.string().optional() // store doctor IDs
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
