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
import { Plus, Eye, Receipt } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "Betaald":
      return "success" as const;
    case "Concept":
      return "secondary" as const;
    case "Verzonden":
      return "default" as const;
    case "Te laat":
      return "destructive" as const;
    case "Deels betaald":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function getOverdueColor(vervaldatum: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - new Date(vervaldatum).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 30) return "bg-red-50";
  if (diffDays >= 14) return "bg-orange-50";
  if (diffDays >= 0) return "bg-green-50";
  return "";
}

async function getFacturen() {
  const facturen = await prisma.factuur.findMany({
    orderBy: { datum: "desc" },
    include: { klant: true },
  });

  // Auto "Te laat": mark Verzonden/Deels betaald facturen past vervaldatum
  const now = new Date();
  const overdueIds = facturen
    .filter(
      (f) =>
        (f.status === "Verzonden" || f.status === "Deels betaald") &&
        new Date(f.vervaldatum) < now
    )
    .map((f) => f.id);

  if (overdueIds.length > 0) {
    await prisma.factuur.updateMany({
      where: { id: { in: overdueIds } },
      data: { status: "Te laat" },
    });
    facturen.forEach((f) => {
      if (overdueIds.includes(f.id)) f.status = "Te laat";
    });
  }

  return facturen;
}

export default async function FacturenPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const facturen = await getFacturen();
  const { filter } = await searchParams;

  const displayFacturen = filter === "openstaand"
    ? facturen
        .filter((f) => ["Verzonden", "Te laat", "Deels betaald"].includes(f.status))
        .sort((a, b) => new Date(a.vervaldatum).getTime() - new Date(b.vervaldatum).getTime())
    : facturen;

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">Facturen</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Beheer al uw facturen en betalingen
          </p>
        </div>
        <Link href="/facturen/nieuw">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nieuwe Factuur</span>
            <span className="sm:hidden">Nieuw</span>
          </Button>
        </Link>
      </div>

      {/* Pipeline Overview - 2 cols mobile, 3 cols tablet, 5 cols desktop */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {(() => {
          const statusConfig = [
            { status: "Concept", label: "Concept", color: "text-gray-600", bg: "bg-gray-50" },
            { status: "Verzonden", label: "Verzonden", color: "text-blue-600", bg: "bg-blue-50" },
            { status: "Te laat", label: "Te laat", color: "text-red-600", bg: "bg-red-50" },
            { status: "Deels betaald", label: "Deels betaald", color: "text-orange-600", bg: "bg-orange-50" },
            { status: "Betaald", label: "Betaald", color: "text-green-600", bg: "bg-green-50" },
          ];

          return statusConfig.map(({ status, label, color, bg }) => {
            const filtered = facturen.filter((f) => f.status === status);
            const count = filtered.length;
            const total = filtered.reduce((sum, f) => sum + f.totaal, 0);

            return (
              <Card key={status} className={bg}>
                <CardContent className="!p-2 md:!p-4">
                  <p className={`text-[10px] md:text-sm font-medium ${color}`}>{label}</p>
                  <p className="text-base md:text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(total)}
                  </p>
                </CardContent>
              </Card>
            );
          });
        })()}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Link href="/facturen">
          <Button variant={!filter ? "default" : "outline"} size="sm">
            Alle
          </Button>
        </Link>
        <Link href="/facturen?filter=openstaand">
          <Button variant={filter === "openstaand" ? "default" : "outline"} size="sm">
            Openstaand
          </Button>
        </Link>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {displayFacturen.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground font-medium">Geen facturen gevonden</p>
            </CardContent>
          </Card>
        ) : (
          displayFacturen.map((factuur) => (
            <Link key={factuur.id} href={`/facturen/${factuur.id}`}>
              <Card className={`${filter === "openstaand" ? getOverdueColor(factuur.vervaldatum) : ""} active:scale-[0.98] transition-transform`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{factuur.factuurNummer}</p>
                      <p className="text-sm text-muted-foreground truncate">{factuur.klant.naam}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">{formatCurrency(factuur.totaal)}</p>
                      <Badge variant={getStatusBadgeVariant(factuur.status)} className="mt-1">
                        {factuur.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>{filter === "openstaand" ? "Openstaande Facturen" : "Alle Facturen"}</CardTitle>
          <CardDescription>
            {displayFacturen.length} factu{displayFacturen.length !== 1 ? "ren" : "ur"}{filter === "openstaand" ? " openstaand" : " in totaal"}
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
                {filter === "openstaand" && <TableHead>Te laat</TableHead>}
                <TableHead className="text-right">Bedrag</TableHead>
                <TableHead className="text-right">Betaald</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayFacturen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={filter === "openstaand" ? 10 : 9} className="text-center py-12">
                    <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">Geen facturen gevonden</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Facturen worden aangemaakt vanuit getekende offertes</p>
                  </TableCell>
                </TableRow>
              ) : (
                displayFacturen.map((factuur) => (
                  <TableRow
                    key={factuur.id}
                    className={filter === "openstaand" ? getOverdueColor(factuur.vervaldatum) : ""}
                  >
                    <TableCell className="font-medium">
                      {factuur.factuurNummer}
                    </TableCell>
                    <TableCell>{factuur.klant.naam}</TableCell>
                    <TableCell>{factuur.projectNaam}</TableCell>
                    <TableCell>{formatDate(factuur.datum)}</TableCell>
                    <TableCell>{formatDate(factuur.vervaldatum)}</TableCell>
                    {filter === "openstaand" && (
                      <TableCell>
                        {(() => {
                          const days = Math.floor((Date.now() - new Date(factuur.vervaldatum).getTime()) / (1000 * 60 * 60 * 24));
                          if (days <= 0) return <span className="text-green-600">Op tijd</span>;
                          return <span className={days > 30 ? "text-red-600 font-semibold" : days >= 14 ? "text-orange-600 font-medium" : "text-green-600"}>{days} dagen</span>;
                        })()}
                      </TableCell>
                    )}
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
