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
    case "Getekend":
      return "success" as const;
    case "Verzonden":
      return "default" as const;
    case "Bekeken":
      return "default" as const;
    case "Concept":
      return "secondary" as const;
    case "Verlopen":
    case "Afgewezen":
      return "destructive" as const;
    default:
      return "default" as const;
  }
}

async function getOffertes() {
  const offertes = await prisma.offerte.findMany({
    orderBy: { datum: "desc" },
    include: { klant: true },
  });

  // Auto-expire: mark Verzonden/Bekeken offertes past geldigTot as Verlopen
  const now = new Date();
  const expiredIds = offertes
    .filter(
      (o) =>
        (o.status === "Verzonden" || o.status === "Bekeken") &&
        new Date(o.geldigTot) < now &&
        !o.klantHandtekening
    )
    .map((o) => o.id);

  if (expiredIds.length > 0) {
    await prisma.offerte.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: "Verlopen" },
    });
    // Update local data
    offertes.forEach((o) => {
      if (expiredIds.includes(o.id)) o.status = "Verlopen";
    });
  }

  return offertes;
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

      {/* Pipeline Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {(() => {
          const statusConfig = [
            { status: "Concept", label: "Concept", color: "text-gray-600", bg: "bg-gray-50" },
            { status: "Verzonden", label: "Verzonden", color: "text-blue-600", bg: "bg-blue-50" },
            { status: "Bekeken", label: "Bekeken", color: "text-purple-600", bg: "bg-purple-50" },
            { status: "Getekend", label: "Getekend", color: "text-green-600", bg: "bg-green-50" },
            { status: "Verlopen", label: "Verlopen", color: "text-orange-600", bg: "bg-orange-50" },
            { status: "Afgewezen", label: "Afgewezen", color: "text-red-600", bg: "bg-red-50" },
          ];

          return statusConfig.map(({ status, label, color, bg }) => {
            const filtered = offertes.filter((o) => o.status === status);
            const count = filtered.length;
            const total = filtered.reduce((sum, o) => sum + o.totaal, 0);

            return (
              <Card key={status} className={bg}>
                <CardContent className="p-4">
                  <p className={`text-sm font-medium ${color}`}>{label}</p>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(total)}
                  </p>
                </CardContent>
              </Card>
            );
          });
        })()}
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

