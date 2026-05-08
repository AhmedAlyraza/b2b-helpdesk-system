import { z } from "zod";

export const createTicketSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  description: z
    .string()
    .min(
      10,
      "Description must be at least 10 characters"
    ),

  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
  ]),
});

export type CreateTicketSchema =
  z.infer<typeof createTicketSchema>;