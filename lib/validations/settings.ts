import { z } from "zod";

export const settingsSchema = z.object({
  bedrijfsnaam: z.string().optional(),
  kvk_nummer: z.string().optional(),
  btw_nummer: z.string().optional(),
  adres: z.string().optional(),
  telefoon: z.string().optional(),
  email: z.string().email("Ongeldig e-mailadres").optional().or(z.literal("")),
  website: z.string().optional(),
  iban: z.string().optional(),
  betalingsvoorwaarden: z.string().optional(),
  smtp_email: z.string().email("Ongeldig e-mailadres").optional().or(z.literal("")),
  smtp_password: z.string().optional(),
  smtp_host: z.string().optional(),
  smtp_port: z.string().optional(),
  mollie_api_key: z.string().optional(),
});

export type Settings = z.infer<typeof settingsSchema>;
