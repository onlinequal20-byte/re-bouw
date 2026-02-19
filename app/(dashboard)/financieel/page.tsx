import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MAANDEN = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

export default async function FinancieelPage({
  searchParams,
}: {
  searchParams: Promise<{ jaar?: string }>;
}) {
  const params = await searchParams;
  const huidigJaar = new Date().getFullYear();
  const jaar = params.jaar ? parseInt(params.jaar, 10) : huidigJaar;

  const startDatum = new Date(jaar, 0, 1);
  const eindDatum = new Date(jaar + 1, 0, 1);

  // Fetch paid invoices and expenses for the selected year
  const [facturen, expenses] = await Promise.all([
    prisma.factuur.findMany({
      where: {
        status: "Betaald",
        datum: { gte: startDatum, lt: eindDatum },
      },
      select: { datum: true, totaal: true },
    }),
    prisma.expense.findMany({
      where: {
        datum: { gte: startDatum, lt: eindDatum },
      },
      select: { datum: true, totaalBedrag: true },
    }),
  ]);

  // Group by month (0-11)
  const maandData = Array.from({ length: 12 }, (_, i) => ({
    maand: i,
    inkomsten: 0,
    uitgaven: 0,
  }));

  for (const f of facturen) {
    maandData[f.datum.getMonth()].inkomsten += f.totaal;
  }

  for (const e of expenses) {
    maandData[e.datum.getMonth()].uitgaven += e.totaalBedrag;
  }

  const totaalInkomsten = maandData.reduce((s, m) => s + m.inkomsten, 0);
  const totaalUitgaven = maandData.reduce((s, m) => s + m.uitgaven, 0);
  const totaalWinst = totaalInkomsten - totaalUitgaven;

  // Year range for selector
  const jaren = [];
  for (let j = huidigJaar - 2; j <= huidigJaar + 1; j++) {
    jaren.push(j);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Financieel Overzicht
        </h1>
        <p className="text-muted-foreground">
          Maandelijks overzicht van inkomsten en uitgaven
        </p>
      </div>

      {/* Year selector */}
      <div className="flex gap-2">
        {jaren.map((j) => (
          <Link key={j} href={`/financieel?jaar=${j}`}>
            <Button variant={j === jaar ? "default" : "outline"} size="sm">
              {j}
            </Button>
          </Link>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal Inkomsten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totaalInkomsten)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal Uitgaven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totaalUitgaven)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal Winst
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${totaalWinst >= 0 ? "text-blue-600" : "text-red-600"}`}
            >
              {formatCurrency(totaalWinst)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly table */}
      <Card>
        <CardHeader>
          <CardTitle>Maandoverzicht {jaar}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Maand</TableHead>
                <TableHead className="text-right">Inkomsten</TableHead>
                <TableHead className="text-right">Uitgaven</TableHead>
                <TableHead className="text-right">Winst</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maandData.map((m) => {
                const winst = m.inkomsten - m.uitgaven;
                return (
                  <TableRow key={m.maand} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link
                        href={`/financieel/maand/${jaar}/${m.maand + 1}`}
                        className="capitalize text-blue-600 hover:underline font-medium"
                      >
                        {MAANDEN[m.maand]}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(m.inkomsten)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(m.uitgaven)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${winst >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(winst)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Totals row */}
              <TableRow className="font-bold border-t-2">
                <TableCell>Totaal</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totaalInkomsten)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totaalUitgaven)}
                </TableCell>
                <TableCell
                  className={`text-right ${totaalWinst >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(totaalWinst)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
