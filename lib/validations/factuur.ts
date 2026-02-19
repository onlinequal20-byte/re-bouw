import { z } from "zod";

export const factuurItemSchema = z.object({
  omschrijving: z.string().min(1, "Omschrijving is verplicht"),
  aantal: z.number().positive("Aantal moet positief zijn"),
  eenheid: z.string().optional().default("stuk"),
  prijsPerEenheid: z.number().positive("Prijs per eenheid moet positief zijn"),
  totaal: z.number(),
  volgorde: z.number().int().optional(),
  btwTarief: z.string().optional().default("HOOG_21"),
});

export const factuurCreateSchema = z.object({
  klantId: z.string().min(1, "Klant is verplicht"),
  projectId: z.string().optional(),
  projectNaam: z.string().min(1, "Projectnaam is verplicht"),
  projectLocatie: z.string().optional(),
  datum: z.string().min(1, "Datum is verplicht"),
  vervaldatum: z.string().min(1, "Vervaldatum is verplicht"),
  items: z.array(factuurItemSchema).min(1, "Minimaal 1 regel is verplicht"),
  notities: z.string().optional(),
  btwPercentage: z.number().min(0).max(100).optional().default(21),
  status: z.enum(["Concept", "Verzonden", "Te laat", "Deels betaald", "Betaald"]).optional().default("Concept"),
  betaaldBedrag: z.number().min(0).optional(),
  kortingType: z.enum(["percentage", "bedrag"]).optional(),
  kortingWaarde: z.number().min(0).optional(),
});

export const factuurUpdateSchema = factuurCreateSchema.partial();

export type FactuurItem = z.infer<typeof factuurItemSchema>;
export type FactuurCreate = z.infer<typeof factuurCreateSchema>;
export type FactuurUpdate = z.infer<typeof factuurUpdateSchema>;

export const factuurHerinneringSchema = z.object({
  type: z.enum(["vriendelijk", "zakelijk", "laatste"]),
});

export type FactuurHerinnering = z.infer<typeof factuurHerinneringSchema>;
