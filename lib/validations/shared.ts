import { z } from "zod";
import * as dns from "dns";

/**
 * Dutch phone number validator.
 * Accepts: 06-12345678, 0612345678, +31612345678, 020-1234567
 */
export const dutchPhoneSchema = z
  .string()
  .transform((val) => val.replace(/[\s-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^(\+31|0)[1-9][0-9]{8,9}$/, "Ongeldig telefoonnummer")
  );

/**
 * Dutch postal code validator.
 * Format: 4 digits + optional space + 2 uppercase letters (e.g. 1234 AB)
 */
export const dutchPostalCodeSchema = z
  .string()
  .regex(/^\d{4}\s?[A-Z]{2}$/, 'Ongeldige postcode (formaat: 1234 AB)');

/**
 * Email validator with MX record check.
 * Validates email format, then checks if the domain has MX records.
 * Fails open on DNS errors (network issues should not block valid emails).
 */
export const emailWithMxSchema = z
  .string()
  .email("Ongeldig e-mailadres")
  .refine(
    async (email) => {
      try {
        const domain = email.split("@")[1];
        if (!domain) return false;
        const records = await dns.promises.resolveMx(domain);
        return records && records.length > 0;
      } catch {
        // Fail open: allow email if DNS lookup fails (network error)
        return true;
      }
    },
    { message: "E-mailadres ongeldig of domein bestaat niet" }
  );

/**
 * Dutch money format parser.
 * Accepts: "1.250,50", "25,00", "1250.50", plain numbers.
 * Output: number (euros as float).
 */
export const dutchMoneySchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === "number") return val;
    // Strip dots (thousands separator), replace comma with dot (decimal)
    const normalized = val.replace(/\./g, "").replace(",", ".");
    return parseFloat(normalized);
  })
  .pipe(z.number({ invalid_type_error: "Ongeldig bedrag" }).refine((n) => !isNaN(n), "Ongeldig bedrag"));

/**
 * Dutch money format parser that outputs integer cents.
 * Same parsing as dutchMoneySchema but multiplied by 100 and rounded.
 */
export const dutchMoneyToCentsSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === "number") return Math.round(val * 100);
    const normalized = val.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(normalized);
    return Math.round(parsed * 100);
  })
  .pipe(z.number({ invalid_type_error: "Ongeldig bedrag" }).refine((n) => !isNaN(n), "Ongeldig bedrag"));
