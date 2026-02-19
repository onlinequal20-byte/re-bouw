import { z } from "zod";

export const projectCreateSchema = z.object({
  naam: z.string().min(1, "Projectnaam is verplicht"),
  locatie: z.string().optional(),
  klantId: z.string().min(1, "Klant is verplicht"),
  status: z.string().optional().default("Actief"),
  notities: z.string().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export type ProjectCreate = z.infer<typeof projectCreateSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
