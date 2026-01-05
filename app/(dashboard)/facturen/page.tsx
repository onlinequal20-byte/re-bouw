import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

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

async function getFacturen() {
  return prisma.factuur.findMany({
    orderBy: { datum: "desc" },
    include: { klant: true },
  });
}

export default async function FacturenPage() {
  const facturen = await getFacturen();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturen</h1>
          <p className="text-muted-foreground">
            Beheer al uw facturen en betalingen
          </p>
        </div>
        <Link href="/facturen/nieuw">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Factuur
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Facturen</CardTitle>
          <CardDescription>
            {facturen.length} factu{facturen.length !== 1 ? "ren" : "ur"} in totaal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nummer</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Vervaldatum</TableHead>
                <TableHead className="text-right">Bedrag</TableHead>
                <TableHead className="text-right">Betaald</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Geen facturen gevonden
                  </TableCell>
                </TableRow>
              ) : (
                facturen.map((factuur) => (
                  <TableRow key={factuur.id}>
                    <TableCell className="font-medium">
                      {factuur.factuurNummer}
                    </TableCell>
                    <TableCell>{factuur.klant.naam}</TableCell>
                    <TableCell>{factuur.projectNaam}</TableCell>
                    <TableCell>{formatDate(factuur.datum)}</TableCell>
                    <TableCell>{formatDate(factuur.vervaldatum)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(factuur.totaal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(factuur.betaaldBedrag)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(factuur.status)}>
                        {factuur.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/facturen/${factuur.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

