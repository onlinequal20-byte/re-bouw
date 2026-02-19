export const BTW_RATES = {
  HOOG_21: 21,
  LAAG_9: 9,
  VERLEGD: 0,
  VRIJGESTELD: 0,
} as const;

export type BtwTarief = keyof typeof BTW_RATES;

export const BTW_LABELS: Record<BtwTarief, string> = {
  HOOG_21: "21% (Hoog)",
  LAAG_9: "9% (Laag)",
  VERLEGD: "Verlegd",
  VRIJGESTELD: "Vrijgesteld",
};

export function calculateItemBtw(subtotalCents: number, tarief: BtwTarief): number {
  return Math.round(subtotalCents * BTW_RATES[tarief] / 100);
}

export function getBtwPercentage(tarief: BtwTarief): number {
  return BTW_RATES[tarief];
}
