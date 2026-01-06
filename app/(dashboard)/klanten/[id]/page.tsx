import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, FileText, Calendar, MapPin, Mail, Phone, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function KlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const klant = await prisma.klant.findUnique({
    where: { id },
    include: {
      facturen: {
        orderBy: { datum: "desc" },
      },
      offertes: {
        orderBy: { datum: "desc" },
      },
      expenses: {
        orderBy: { datum: "desc" },
      },
    },
  });

  if (!klant) {
    notFound();
  }

  // Calculate totals
  const totalFacturen = klant.facturen.reduce((sum, f) => sum + f.totaal, 0);
  const totalBetaald = klant.facturen.reduce((sum, f) => sum + f.betaaldBedrag, 0);
  const totalExpenses = klant.expenses.reduce((sum, e) => sum + e.totaalBedrag, 0);
  const winst = totalBetaald - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/klanten">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{klant.naam}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" /> {klant.email || "Geen email"}
            <span className="mx-2">•</span>
            <Phone className="h-4 w-4" /> {klant.telefoon || "Geen telefoon"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-enhanced border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal Gefactureerd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalFacturen)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Betaald: {formatCurrency(totalBetaald)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal Kosten (Bonnetjes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {klant.expenses.length} bonnetjes
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Winst (Betaald - Kosten)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${winst >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {formatCurrency(winst)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Klantgegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Adres</span>
                <p>{klant.adres || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Postcode/Plaats</span>
                <p>{klant.postcode} {klant.plaats}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">KVK Nummer</span>
                <p>{klant.kvkNummer || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Klant sinds</span>
                <p>{formatDate(klant.createdAt)}</p>
              </div>
            </div>
            {klant.notities && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-sm font-medium text-muted-foreground">Notities</span>
                <p className="mt-1 text-sm whitespace-pre-wrap">{klant.notities}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Kosten & Bonnetjes
            </CardTitle>
            <CardDescription>
              Overzicht van kosten gemaakt voor deze klant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Omschrijving</TableHead>
                  <TableHead className="text-right">Bedrag</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {klant.expenses.slice(0, 5).map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.datum)}</TableCell>
                    <TableCell>{expense.omschrijving}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.totaalBedrag)}</TableCell>
                    <TableCell>
                      {expense.imageUrl && (
                        <a href={expense.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {klant.expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Geen kosten geboekt
                    </TableCell>
                  </TableRow>
                )}
                {klant.expenses.length > 5 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <Link href={`/kosten?klantId=${klant.id}`} className="text-sm text-blue-600 hover:underline">
                        Bekijk alle {klant.expenses.length} bonnetjes
                      </Link>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Recente Facturen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nummer</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Bedrag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {klant.facturen.map((factuur) => (
                <TableRow key={factuur.id}>
                  <TableCell className="font-medium">
                    <Link href={`/facturen/${factuur.id}`} className="hover:underline">
                      {factuur.factuurNummer}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(factuur.datum)}</TableCell>
                  <TableCell>{factuur.projectNaam}</TableCell>
                  <TableCell>
                    <Badge variant={factuur.status === "Betaald" ? "default" : "secondary"}>
                      {factuur.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(factuur.totaal)}</TableCell>
                </TableRow>
              ))}
              {klant.facturen.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Geen facturen gevonden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


