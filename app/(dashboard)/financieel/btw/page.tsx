import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QuarterData {
  outputHoog21: number;
  outputLaag9: number;
  outputVerlegd: number;
  outputVrijgesteld: number;
  totalOutput: number;
  inputBtw: number;
  teBetalen: number;
}

function emptyQuarter(): QuarterData {
  return {
    outputHoog21: 0,
    outputLaag9: 0,
    outputVerlegd: 0,
    outputVrijgesteld: 0,
    totalOutput: 0,
    inputBtw: 0,
    teBetalen: 0,
  };
}

function getQuarter(date: Date): number {
  const month = date.getMonth(); // 0-indexed
  if (month < 3) return 1;
  if (month < 6) return 2;
  if (month < 9) return 3;
  return 4;
}

export default async function BtwOverzichtPage({
  searchParams,
}: {
  searchParams: Promise<{ jaar?: string }>;
}) {
  const params = await searchParams;
  const jaar = params.jaar ? parseInt(params.jaar) : new Date().getFullYear();

  const startDate = new Date(jaar, 0, 1);
  const endDate = new Date(jaar + 1, 0, 1);

  // Fetch paid invoice items with their invoice date
  const factuurItems = await prisma.factuurItem.findMany({
    where: {
      factuur: {
        status: "Betaald",
        datum: {
          gte: startDate,
          lt: endDate,
        },
      },
    },
    include: {
      factuur: {
        select: { datum: true },
      },
    },
  });

  // Fetch expenses for the year
  const expenses = await prisma.expense.findMany({
    where: {
      datum: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  // Group into quarters
  const quarters: Record<number, QuarterData> = {
    1: emptyQuarter(),
    2: emptyQuarter(),
    3: emptyQuarter(),
    4: emptyQuarter(),
  };

  for (const item of factuurItems) {
    const q = getQuarter(item.factuur.datum);
    const qd = quarters[q];

    switch (item.btwTarief) {
      case "HOOG_21":
        qd.outputHoog21 += item.btwBedrag;
        break;
      case "LAAG_9":
        qd.outputLaag9 += item.btwBedrag;
        break;
      case "VERLEGD":
        qd.outputVerlegd += item.btwBedrag;
        break;
      case "VRIJGESTELD":
        qd.outputVrijgesteld += item.btwBedrag;
        break;
    }
  }

  for (const expense of expenses) {
    const q = getQuarter(expense.datum);
    quarters[q].inputBtw += expense.btw;
  }

  // Calculate totals per quarter
  for (const q of [1, 2, 3, 4]) {
    const qd = quarters[q];
    qd.totalOutput = qd.outputHoog21 + qd.outputLaag9 + qd.outputVerlegd + qd.outputVrijgesteld;
    qd.teBetalen = qd.totalOutput - qd.inputBtw;
  }

  // Year totals
  const yearTotals: QuarterData = {
    outputHoog21: Object.values(quarters).reduce((s, q) => s + q.outputHoog21, 0),
    outputLaag9: Object.values(quarters).reduce((s, q) => s + q.outputLaag9, 0),
    outputVerlegd: Object.values(quarters).reduce((s, q) => s + q.outputVerlegd, 0),
    outputVrijgesteld: Object.values(quarters).reduce((s, q) => s + q.outputVrijgesteld, 0),
    totalOutput: Object.values(quarters).reduce((s, q) => s + q.totalOutput, 0),
    inputBtw: Object.values(quarters).reduce((s, q) => s + q.inputBtw, 0),
    teBetalen: Object.values(quarters).reduce((s, q) => s + q.teBetalen, 0),
  };

  const quarterLabels: Record<number, string> = {
    1: "Q1 (jan - mrt)",
    2: "Q2 (apr - jun)",
    3: "Q3 (jul - sep)",
    4: "Q4 (okt - dec)",
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">BTW Overzicht</h1>
        <p className="text-muted-foreground">
          Kwartaaloverzicht voor BTW aangifte
        </p>
      </div>

      {/* Year selector */}
      <div className="flex gap-2">
        {years.map((y) => (
          <Link key={y} href={`/financieel/btw?jaar=${y}`}>
            <Button variant={y === jaar ? "default" : "outline"} size="sm">
              {y}
            </Button>
          </Link>
        ))}
      </div>

      {/* Quarter cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((q) => {
          const qd = quarters[q];
          return (
            <Card key={q}>
              <CardHeader>
                <CardTitle>{quarterLabels[q]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Output BTW 21%</span>
                  <span>{formatCurrency(qd.outputHoog21)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Output BTW 9%</span>
                  <span>{formatCurrency(qd.outputLaag9)}</span>
                </div>
                {qd.outputVerlegd > 0 && (
                  <div className="flex justify-between">
                    <span>BTW Verlegd</span>
                    <span>{formatCurrency(qd.outputVerlegd)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span>Totaal verschuldigde BTW</span>
                  <span>{formatCurrency(qd.totalOutput)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Voorbelasting (input BTW)</span>
                  <span>{formatCurrency(qd.inputBtw)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Te betalen</span>
                  <span>{formatCurrency(qd.teBetalen)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Year totals */}
      <Card>
        <CardHeader>
          <CardTitle>Jaartotaal {jaar}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Output BTW 21%</span>
            <span>{formatCurrency(yearTotals.outputHoog21)}</span>
          </div>
          <div className="flex justify-between">
            <span>Output BTW 9%</span>
            <span>{formatCurrency(yearTotals.outputLaag9)}</span>
          </div>
          {yearTotals.outputVerlegd > 0 && (
            <div className="flex justify-between">
              <span>BTW Verlegd</span>
              <span>{formatCurrency(yearTotals.outputVerlegd)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span>Totaal verschuldigde BTW</span>
            <span>{formatCurrency(yearTotals.totalOutput)}</span>
          </div>
          <div className="flex justify-between">
            <span>Voorbelasting (input BTW)</span>
            <span>{formatCurrency(yearTotals.inputBtw)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold text-lg">
            <span>Te betalen</span>
            <span>{formatCurrency(yearTotals.teBetalen)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Download buttons */}
      <div className="flex gap-3">
        <Link href={`/api/financieel/btw/pdf?jaar=${jaar}`}>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            PDF Downloaden
          </Button>
        </Link>
        <Link href={`/api/financieel/btw/csv?jaar=${jaar}`}>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            CSV Exporteren
          </Button>
        </Link>
      </div>
    </div>
  );
}
