import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, FileText, Receipt, DollarSign } from "lucide-react";
import Link from "next/link";

function getStatusVariant(status: string) {
  switch (status) {
    case "Actief":
      return "success" as const;
    case "Afgerond":
      return "secondary" as const;
    case "Geannuleerd":
      return "destructive" as const;
    default:
      return "default" as const;
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      klant: true,
      offertes: {
        orderBy: { datum: "desc" },
        include: { klant: true },
      },
      facturen: {
        orderBy: { datum: "desc" },
        include: { klant: true },
      },
      expenses: {
        orderBy: { datum: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const totaalOffertes = project.offertes.reduce((sum, o) => sum + o.totaal, 0);
  const totaalFacturen = project.facturen.reduce((sum, f) => sum + f.totaal, 0);
  const totaalBetaald = project.facturen.reduce((sum, f) => sum + f.betaaldBedrag, 0);
  const totaalKosten = project.expenses.reduce((sum, e) => sum + e.totaalBedrag, 0);
  const winst = totaalBetaald - totaalKosten;
  const openstaand = totaalFacturen - totaalBetaald;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projecten">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {project.projectNummer}
            </h1>
            <p className="text-muted-foreground">{project.naam}</p>
          </div>
        </div>
        <Badge variant={getStatusVariant(project.status)} className="text-sm px-3 py-1">
          {project.status}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totaalOffertes)}</div>
            <p className="text-xs text-muted-foreground">{project.offertes.length} offerte(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gefactureerd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totaalFacturen)}</div>
            <p className="text-xs text-muted-foreground">{project.facturen.length} factuur/facturen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Openstaand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${openstaand > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {formatCurrency(openstaand)}
            </div>
            <p className="text-xs text-muted-foreground">Nog te ontvangen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kosten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totaalKosten)}</div>
            <p className="text-xs text-muted-foreground">{project.expenses.length} uitgave(n)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Winst</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${winst >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(winst)}
            </div>
            <p className="text-xs text-muted-foreground">Gefactureerd - Kosten</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projectgegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Klant:</span>
              <p className="font-medium">
                <Link href={`/klanten/${project.klant.id}`} className="text-blue-600 hover:underline">
                  {project.klant.naam}
                </Link>
              </p>
            </div>
            {project.locatie && (
              <div>
                <span className="text-sm text-muted-foreground">Locatie:</span>
                <p className="font-medium">{project.locatie}</p>
              </div>
            )}
            {project.notities && (
              <div>
                <span className="text-sm text-muted-foreground">Notities:</span>
                <p className="whitespace-pre-wrap">{project.notities}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Offertes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Offertes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {project.offertes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Geen offertes gekoppeld</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nummer</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Totaal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.offertes.map((offerte) => (
                  <TableRow key={offerte.id}>
                    <TableCell>
                      <Link href={`/offertes/${offerte.id}`} className="text-blue-600 hover:underline font-mono text-sm">
                        {offerte.offerteNummer}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(offerte.datum)}</TableCell>
                    <TableCell>
                      <Badge variant={offerte.status === "Geaccepteerd" ? "success" : offerte.status === "Afgewezen" ? "destructive" : "secondary"}>
                        {offerte.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(offerte.totaal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Facturen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Facturen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {project.facturen.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Geen facturen gekoppeld</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nummer</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Totaal</TableHead>
                  <TableHead className="text-right">Betaald</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.facturen.map((factuur) => (
                  <TableRow key={factuur.id}>
                    <TableCell>
                      <Link href={`/facturen/${factuur.id}`} className="text-blue-600 hover:underline font-mono text-sm">
                        {factuur.factuurNummer}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(factuur.datum)}</TableCell>
                    <TableCell>
                      <Badge variant={factuur.status === "Betaald" ? "success" : factuur.status === "Achterstallig" ? "destructive" : "default"}>
                        {factuur.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(factuur.totaal)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(factuur.betaaldBedrag)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Kosten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {project.expenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Geen kosten gekoppeld</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Omschrijving</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead className="text-right">Bedrag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.datum)}</TableCell>
                    <TableCell>{expense.omschrijving}</TableCell>
                    <TableCell>{expense.categorie}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(expense.totaalBedrag)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
