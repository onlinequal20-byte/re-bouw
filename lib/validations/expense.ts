import { z } from "zod";

export const expenseCreateSchema = z.object({
  omschrijving: z.string().min(1, "Omschrijving is verplicht"),
  bedrag: z.number().positive("Bedrag moet positief zijn"),
  datum: z.string().min(1, "Datum is verplicht"),
  categorie: z.string().optional().default("Overig"),
  leverancier: z.string().optional(),
  btw: z.number().min(0).optional().default(0),
  notities: z.string().optional(),
  klantId: z.string().optional(),
  offerteId: z.string().optional(),
  factuurId: z.string().optional(),
  projectId: z.string().optional(),
});

/**
 * Patch schema: explicitly pick allowed fields to prevent mass assignment.
 * Only known, safe fields can be updated via PATCH.
 */
export const expensePatchSchema = z.object({
  omschrijving: z.string().min(1, "Omschrijving is verplicht").optional(),
  bedrag: z.number().positive("Bedrag moet positief zijn").optional(),
  datum: z.string().optional(),
  categorie: z.string().optional(),
  leverancier: z.string().optional(),
  btw: z.number().min(0).optional(),
  notities: z.string().optional(),
  klantId: z.string().nullable().optional(),
  offerteId: z.string().nullable().optional(),
  factuurId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  ocrVerified: z.boolean().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export type ExpenseCreate = z.infer<typeof expenseCreateSchema>;
export type ExpensePatch = z.infer<typeof expensePatchSchema>;
