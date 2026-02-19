import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format cents (integer) as Dutch currency string.
 * All monetary values in the database are stored as integer cents.
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

/**
 * Convert euro amount to integer cents.
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Format cents as Dutch euro string without currency symbol (e.g. "1.250,50").
 */
export function centsToEuroString(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatDateLong(date: Date | string): string {
  const d = new Date(date);
  const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

