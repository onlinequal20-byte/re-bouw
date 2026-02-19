import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface QuarterData {
  btwHoog: number;
  btwLaag: number;
  btwVerlegd: number;
  voorbelasting: number;
}

function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jaarParam = searchParams.get("jaar");
  const jaar = jaarParam ? parseInt(jaarParam, 10) : new Date().getFullYear();

  if (isNaN(jaar) || jaar < 2000 || jaar > 2100) {
    return Response.json({ error: "Ongeldig jaar" }, { status: 400 });
  }

  const startDate = new Date(jaar, 0, 1);
  const endDate = new Date(jaar + 1, 0, 1);

  const facturen = await prisma.factuur.findMany({
    where: {
      datum: { gte: startDate, lt: endDate },
      status: { in: ["Verzonden", "Betaald", "Deels Betaald"] },
    },
    include: { items: true },
  });

  const expenses = await prisma.expense.findMany({
    where: {
      datum: { gte: startDate, lt: endDate },
      status: "approved",
    },
  });

  const quarters: [QuarterData, QuarterData, QuarterData, QuarterData] = [
    { btwHoog: 0, btwLaag: 0, btwVerlegd: 0, voorbelasting: 0 },
    { btwHoog: 0, btwLaag: 0, btwVerlegd: 0, voorbelasting: 0 },
    { btwHoog: 0, btwLaag: 0, btwVerlegd: 0, voorbelasting: 0 },
    { btwHoog: 0, btwLaag: 0, btwVerlegd: 0, voorbelasting: 0 },
  ];

  for (const factuur of facturen) {
    const q = getQuarter(new Date(factuur.datum));
    for (const item of factuur.items) {
      const tarief = item.btwTarief || "HOOG_21";
      const btwAmount = item.btwBedrag || 0;
      if (tarief === "HOOG_21") {
        quarters[q].btwHoog += btwAmount;
      } else if (tarief === "LAAG_9") {
        quarters[q].btwLaag += btwAmount;
      } else {
        quarters[q].btwVerlegd += btwAmount;
      }
    }
  }

  for (const expense of expenses) {
    const q = getQuarter(new Date(expense.datum));
    quarters[q].voorbelasting += expense.btw || 0;
  }

  const fmt = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

  const header = "Omschrijving;Q1;Q2;Q3;Q4;Jaar totaal";
  const rows = [
    ["Verschuldigde BTW (21%)", ...quarters.map((q) => q.btwHoog), quarters.reduce((s, q) => s + q.btwHoog, 0)],
    ["Verschuldigde BTW (9%)", ...quarters.map((q) => q.btwLaag), quarters.reduce((s, q) => s + q.btwLaag, 0)],
    ["Verlegd / Vrijgesteld", ...quarters.map((q) => q.btwVerlegd), quarters.reduce((s, q) => s + q.btwVerlegd, 0)],
    ["Totaal verschuldigde BTW", ...quarters.map((q) => q.btwHoog + q.btwLaag + q.btwVerlegd), quarters.reduce((s, q) => s + q.btwHoog + q.btwLaag + q.btwVerlegd, 0)],
    ["Voorbelasting (aftrekbaar)", ...quarters.map((q) => q.voorbelasting), quarters.reduce((s, q) => s + q.voorbelasting, 0)],
    ["Te betalen BTW", ...quarters.map((q) => q.btwHoog + q.btwLaag + q.btwVerlegd - q.voorbelasting), quarters.reduce((s, q) => s + q.btwHoog + q.btwLaag + q.btwVerlegd - q.voorbelasting, 0)],
  ];

  const csv = [header, ...rows.map((r) => `${r[0]};${fmt(r[1] as number)};${fmt(r[2] as number)};${fmt(r[3] as number)};${fmt(r[4] as number)};${fmt(r[5] as number)}`)].join("\n");

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="btw-overzicht-${jaar}.csv"`,
    },
  });
}
