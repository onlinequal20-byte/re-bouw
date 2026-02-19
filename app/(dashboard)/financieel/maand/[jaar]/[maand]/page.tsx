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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  Receipt,
  TrendingDown,
  Calculator,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const MAAND_NAMEN = [
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

function statusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Betaald":
      return "default";
    case "Verzonden":
      return "default";
    case "Concept":
      return "secondary";
    case "Te laat":
      return "destructive";
    case "Getekend":
      return "default";
    case "Verlopen":
      return "destructive";
    case "Afgewezen":
      return "destructive";
    case "Bekeken":
      return "outline";
    default:
      return "secondary";
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "Betaald":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Te laat":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "Getekend":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Verlopen":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "Afgewezen":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "";
  }
}

function categorieBadgeVariant(
  categorie: string
): "default" | "secondary" | "outline" | "destructive" {
  switch (categorie) {
    case "Materialen":
      return "default";
    case "Voertuig":
      return "secondary";
    case "Abonnementen":
      return "outline";
    case "Transport":
      return "secondary";
    case "Gereedschap":
      return "default";
    case "Onderaanneming":
      return "destructive";
    case "Overig":
      return "outline";
    default:
      return "outline";
  }
}

export default async function MaandDetailPage({
  params,
}: {
  params: Promise<{ jaar: string; maand: string }>;
}) {
  const { jaar: jaarStr, maand: maandStr } = await params;
  const jaar = parseInt(jaarStr, 10);
  const maand = parseInt(maandStr, 10);

  if (isNaN(jaar) || isNaN(maand) || maand < 1 || maand > 12) {
    notFound();
  }

  const maandNaam = MAAND_NAMEN[maand - 1];
  const startDatum = new Date(jaar, maand - 1, 1);
  const eindDatum = new Date(jaar, maand, 1);

  const [facturen, expenses, offertes] = await Promise.all([
    prisma.factuur.findMany({
      where: { datum: { gte: startDatum, lt: eindDatum } },
      include: { klant: true, items: true },
      orderBy: { datum: "desc" },
    }),
    prisma.expense.findMany({
      where: { datum: { gte: startDatum, lt: eindDatum } },
      include: {
        project: { select: { id: true, naam: true, projectNummer: true } },
      },
      orderBy: { datum: "desc" },
    }),
    prisma.offerte.findMany({
      where: { datum: { gte: startDatum, lt: eindDatum } },
      include: { klant: true },
      orderBy: { datum: "desc" },
    }),
  ]);

  // Summary calculations
  const inkomsten = facturen
    .filter((f) => f.status === "Betaald")
    .reduce((sum, f) => sum + f.totaal, 0);

  const uitgaven = expenses.reduce((sum, e) => sum + e.totaalBedrag, 0);

  const winst = inkomsten - uitgaven;

  // BTW calculations
  const btwOutput = facturen
    .filter((f) => f.status === "Betaald")
    .reduce((sum, f) => {
      return sum + f.items.reduce((iSum, item) => iSum + item.btwBedrag, 0);
    }, 0);

  const btwInput = expenses.reduce((sum, e) => sum + e.btw, 0);

  const btwSaldo = btwOutput - btwInput;

  // BTW split by tariff for paid invoices
  const btwHoog = facturen
    .filter((f) => f.status === "Betaald")
    .reduce((sum, f) => {
      return (
        sum +
        f.items
          .filter((item) => item.btwTarief === "HOOG_21")
          .reduce((iSum, item) => iSum + item.btwBedrag, 0)
      );
    }, 0);

  const btwLaag = facturen
    .filter((f) => f.status === "Betaald")
    .reduce((sum, f) => {
      return (
        sum +
        f.items
          .filter((item) => item.btwTarief === "LAAG_9")
          .reduce((iSum, item) => iSum + item.btwBedrag, 0)
      );
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/financieel?jaar=${jaar}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight capitalize">
            {maandNaam} {jaar}
          </h1>
          <p className="text-muted-foreground">
            Financieel overzicht voor deze maand
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inkomsten</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(inkomsten)}
            </div>
            <p className="text-xs text-muted-foreground">
              Betaalde facturen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uitgaven</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(uitgaven)}
            </div>
            <p className="text-xs text-muted-foreground">
              Totaal uitgaven
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Winst</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                winst >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatCurrency(winst)}
            </div>
            <p className="text-xs text-muted-foreground">
              Inkomsten - uitgaven
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BTW Saldo</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                btwSaldo >= 0 ? "text-orange-600" : "text-green-600"
              }`}
            >
              {formatCurrency(btwSaldo)}
            </div>
            <p className="text-xs text-muted-foreground">
              {btwSaldo >= 0 ? "Te betalen" : "Terug te vorderen"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="facturen">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="facturen" className="gap-2">
            <FileText className="h-4 w-4" />
            Facturen
            <Badge variant="secondary" className="ml-1">
              {facturen.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="uitgaven" className="gap-2">
            <Receipt className="h-4 w-4" />
            Uitgaven
            <Badge variant="secondary" className="ml-1">
              {expenses.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="offertes" className="gap-2">
            <FileText className="h-4 w-4" />
            Offertes
            <Badge variant="secondary" className="ml-1">
              {offertes.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="btw" className="gap-2">
            <Calculator className="h-4 w-4" />
            BTW
          </TabsTrigger>
        </TabsList>

        {/* Facturen Tab */}
        <TabsContent value="facturen">
          <Card>
            <CardHeader>
              <CardTitle>Facturen</CardTitle>
            </CardHeader>
            <CardContent>
              {facturen.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Geen facturen in deze maand
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nummer</TableHead>
                      <TableHead>Klant</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Bedrag</TableHead>
                      <TableHead className="text-right">BTW</TableHead>
                      <TableHead className="text-right">Totaal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturen.map((factuur) => (
                      <TableRow key={factuur.id}>
                        <TableCell>
                          <Link
                            href={`/facturen/${factuur.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {factuur.factuurNummer}
                          </Link>
                        </TableCell>
                        <TableCell>{factuur.klant.naam}</TableCell>
                        <TableCell>{formatDate(factuur.datum)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={statusBadgeVariant(factuur.status)}
                            className={statusBadgeClass(factuur.status)}
                          >
                            {factuur.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(factuur.subtotaal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(factuur.btwBedrag)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(factuur.totaal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Uitgaven Tab */}
        <TabsContent value="uitgaven">
          <Card>
            <CardHeader>
              <CardTitle>Uitgaven</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Geen uitgaven in deze maand
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Omschrijving</TableHead>
                      <TableHead>Categorie</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="text-right">Bedrag</TableHead>
                      <TableHead className="text-right">BTW</TableHead>
                      <TableHead className="text-right">Totaal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.datum)}</TableCell>
                        <TableCell>{expense.omschrijving}</TableCell>
                        <TableCell>
                          <Badge
                            variant={categorieBadgeVariant(expense.categorie)}
                          >
                            {expense.categorie}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {expense.project ? (
                            <Link
                              href={`/projecten/${expense.project.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {expense.project.projectNummer}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(expense.bedrag)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(expense.btw)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(expense.totaalBedrag)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offertes Tab */}
        <TabsContent value="offertes">
          <Card>
            <CardHeader>
              <CardTitle>Offertes</CardTitle>
            </CardHeader>
            <CardContent>
              {offertes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Geen offertes in deze maand
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nummer</TableHead>
                      <TableHead>Klant</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Totaal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offertes.map((offerte) => (
                      <TableRow key={offerte.id}>
                        <TableCell>
                          <Link
                            href={`/offertes/${offerte.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {offerte.offerteNummer}
                          </Link>
                        </TableCell>
                        <TableCell>{offerte.klant.naam}</TableCell>
                        <TableCell>{formatDate(offerte.datum)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={statusBadgeVariant(offerte.status)}
                            className={statusBadgeClass(offerte.status)}
                          >
                            {offerte.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(offerte.totaal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BTW Tab */}
        <TabsContent value="btw">
          <Card>
            <CardHeader>
              <CardTitle>BTW Overzicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verschuldigde BTW */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">
                  Verschuldigde BTW (output)
                </h3>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">BTW 21% (hoog tarief)</span>
                    <span className="font-medium">{formatCurrency(btwHoog)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">BTW 9% (laag tarief)</span>
                    <span className="font-medium">{formatCurrency(btwLaag)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b font-semibold">
                    <span>Totaal verschuldigde BTW</span>
                    <span>{formatCurrency(btwOutput)}</span>
                  </div>
                </div>
              </div>

              {/* Voorbelasting */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">
                  Voorbelasting (input)
                </h3>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">BTW op uitgaven</span>
                    <span className="font-medium">{formatCurrency(btwInput)}</span>
                  </div>
                </div>
              </div>

              {/* Saldo */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Saldo</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Verschuldigde BTW</span>
                    <span className="font-medium">{formatCurrency(btwOutput)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Voorbelasting (aftrek)</span>
                    <span className="font-medium text-green-600">
                      - {formatCurrency(btwInput)}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center py-3 px-4 rounded-lg font-bold text-lg ${
                      btwSaldo >= 0
                        ? "bg-orange-50 text-orange-800"
                        : "bg-green-50 text-green-800"
                    }`}
                  >
                    <span>
                      {btwSaldo >= 0 ? "Te betalen" : "Terug te vorderen"}
                    </span>
                    <span>{formatCurrency(Math.abs(btwSaldo))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
