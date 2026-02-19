import { z } from "zod";

export const klantCreateSchema = z.object({
  naam: z.string().min(1, "Naam is verplicht"),
  email: z.string().optional(),
  telefoon: z.string().optional(),
  adres: z.string().optional(),
  postcode: z.string().optional(),
  plaats: z.string().optional(),
  kvkNummer: z.string().optional(),
  notities: z.string().optional(),
});

export const klantUpdateSchema = klantCreateSchema.partial();

export type KlantCreate = z.infer<typeof klantCreateSchema>;
export type KlantUpdate = z.infer<typeof klantUpdateSchema>;
