import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
});

export type LoginInput = z.infer<typeof loginSchema>;
