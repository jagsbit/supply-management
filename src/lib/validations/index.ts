import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const createRequestSchema = z.object({
  inventoryItemId: z.string().min(1, "Please select an item"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  remarks: z.string().optional(),
});

export const reviewRequestSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type ReviewRequestInput = z.infer<typeof reviewRequestSchema>;
