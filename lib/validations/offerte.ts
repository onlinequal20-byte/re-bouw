import { z } from "zod";

export const offerteItemSchema = z.object({
  omschrijving: z.string().min(1, "Omschrijving is verplicht"),
  aantal: z.number().positive("Aantal moet positief zijn"),
  eenheid: z.string().optional().default("stuk"),
  prijsPerEenheid: z.number().positive("Prijs per eenheid moet positief zijn"),
  totaal: z.number(),
  volgorde: z.number().int().optional(),
  btwTarief: z.string().optional().default("HOOG_21"),
});

export const offerteCreateSchema = z.object({
  klantId: z.string().min(1, "Klant is verplicht"),
  projectId: z.string().optional(),
  projectNaam: z.string().min(1, "Projectnaam is verplicht"),
  projectLocatie: z.string().optional(),
  datum: z.string().min(1, "Datum is verplicht"),
  geldigTot: z.string().min(1, "Geldig tot datum is verplicht"),
  items: z.array(offerteItemSchema).min(1, "Minimaal 1 regel is verplicht"),
  notities: z.string().optional(),
  btwPercentage: z.number().min(0).max(100).optional().default(21),
  status: z.enum(["Concept", "Verzonden", "Bekeken", "Getekend", "Verlopen", "Afgewezen"]).optional(),
});

export const offerteUpdateSchema = offerteCreateSchema.partial();

export type OfferteItem = z.infer<typeof offerteItemSchema>;
export type OfferteCreate = z.infer<typeof offerteCreateSchema>;
export type OfferteUpdate = z.infer<typeof offerteUpdateSchema>;
