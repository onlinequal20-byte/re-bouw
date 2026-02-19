import { z } from "zod";
import { dutchPhoneSchema, dutchPostalCodeSchema, emailWithMxSchema } from "./shared";

export const klantCreateSchema = z.object({
  naam: z.string().min(1, "Naam is verplicht"),
  email: emailWithMxSchema.optional().or(z.literal("")),
  telefoon: dutchPhoneSchema.optional().or(z.literal("")),
  adres: z.string().optional(),
  postcode: dutchPostalCodeSchema.optional().or(z.literal("")),
  plaats: z.string().optional(),
  kvkNummer: z.string().optional(),
  notities: z.string().optional(),
});

export const klantUpdateSchema = klantCreateSchema.partial();

export type KlantCreate = z.infer<typeof klantCreateSchema>;
export type KlantUpdate = z.infer<typeof klantUpdateSchema>;
