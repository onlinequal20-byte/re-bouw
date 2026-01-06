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
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { EmailButton } from "@/components/email-button";
import { PaymentButton } from "@/components/payment-button";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "Betaald":
      return "success" as const;
    case "Onbetaald":
      return "warning" as const;
    case "Achterstallig":
      return "destructive" as const;
    case "Gedeeltelijk betaald":
      return "default" as const;
    default:
      return "default" as const;
  }
}

export default async function FactuurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const factuur = await prisma.factuur.findUnique({
    where: { id },
    include: {
      klant: true,
      items: {
        orderBy: { volgorde: "asc" },
      },
    },
  });

  if (!factuur) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/facturen">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {factuur.factuurNummer}
            </h1>
            <p className="text-muted-foreground">Factuur details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <PaymentButton
            factuurId={factuur.id}
            factuurNummer={factuur.factuurNummer}
            remainingAmount={factuur.totaal - factuur.betaaldBedrag}
            status={factuur.status}
          />
          <a href={`/api/facturen/${factuur.id}/pdf`} target="_blank">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </a>
          <EmailButton
            id={factuur.id}
            type="factuur"
            clientEmail={factuur.klant.email}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Klantgegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Naam:</span>
              <p className="font-medium">{factuur.klant.naam}</p>
            </div>
            {factuur.klant.email && (
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{factuur.klant.email}</p>
              </div>
            )}
            {factuur.klant.telefoon && (
              <div>
                <span className="text-sm text-muted-foreground">Telefoon:</span>
                <p className="font-medium">{factuur.klant.telefoon}</p>
              </div>
            )}
            {factuur.klant.adres && (
              <div>
                <span className="text-sm text-muted-foreground">Adres:</span>
                <p className="font-medium">{factuur.klant.adres}</p>
                {factuur.klant.postcode && factuur.klant.plaats && (
                  <p className="font-medium">
                    {factuur.klant.postcode} {factuur.klant.plaats}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Factuur Gegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Status:</span>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(factuur.status)}>
                  {factuur.status}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Datum:</span>
              <p className="font-medium">{formatDate(factuur.datum)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Vervaldatum:</span>
              <p className="font-medium">{formatDate(factuur.vervaldatum)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Betaald bedrag:</span>
              <p className="font-medium">
                {formatCurrency(factuur.betaaldBedrag)} van {formatCurrency(factuur.totaal)}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Project:</span>
              <p className="font-medium">{factuur.projectNaam}</p>
              {factuur.projectLocatie && (
                <p className="text-sm text-muted-foreground">
                  {factuur.projectLocatie}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Omschrijving</TableHead>
                <TableHead className="text-right">Aantal</TableHead>
                <TableHead>Eenheid</TableHead>
                <TableHead className="text-right">Prijs/Eenheid</TableHead>
                <TableHead className="text-right">Totaal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {factuur.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.omschrijving}</TableCell>
                  <TableCell className="text-right">{item.aantal}</TableCell>
                  <TableCell>{item.eenheid}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.prijsPerEenheid)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.totaal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotaal:</span>
              <span className="font-medium">
                {formatCurrency(factuur.subtotaal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                BTW ({factuur.btwPercentage}%):
              </span>
              <span className="font-medium">
                {formatCurrency(factuur.btwBedrag)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Totaal:</span>
              <span>{formatCurrency(factuur.totaal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {factuur.notities && (
        <Card>
          <CardHeader>
            <CardTitle>Notities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{factuur.notities}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

