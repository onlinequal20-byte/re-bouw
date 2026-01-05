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
    case "Geaccepteerd":
      return "success" as const;
    case "Verzonden":
      return "default" as const;
    case "Concept":
      return "secondary" as const;
    case "Afgewezen":
      return "destructive" as const;
    default:
      return "default" as const;
  }
}

async function getOffertes() {
  return prisma.offerte.findMany({
    orderBy: { datum: "desc" },
    include: { klant: true },
  });
}

export default async function OffertesPage() {
  const offertes = await getOffertes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offertes</h1>
          <p className="text-muted-foreground">
            Beheer al uw offertes en prijsopgaven
          </p>
        </div>
        <Link href="/offertes/nieuw">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Offerte
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Offertes</CardTitle>
          <CardDescription>
            {offertes.length} offerte{offertes.length !== 1 ? "s" : ""} in totaal
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
                <TableHead>Geldig Tot</TableHead>
                <TableHead className="text-right">Bedrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offertes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Geen offertes gevonden
                  </TableCell>
                </TableRow>
              ) : (
                offertes.map((offerte) => (
                  <TableRow key={offerte.id}>
                    <TableCell className="font-medium">
                      {offerte.offerteNummer}
                    </TableCell>
                    <TableCell>{offerte.klant.naam}</TableCell>
                    <TableCell>{offerte.projectNaam}</TableCell>
                    <TableCell>{formatDate(offerte.datum)}</TableCell>
                    <TableCell>{formatDate(offerte.geldigTot)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(offerte.totaal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(offerte.status)}>
                        {offerte.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/offertes/${offerte.id}`}>
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

