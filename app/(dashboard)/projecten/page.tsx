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
import { Plus, Eye, FolderOpen } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

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

async function getProjecten() {
  const projecten = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      klant: { select: { id: true, naam: true } },
      offertes: { select: { totaal: true } },
      facturen: { select: { totaal: true, betaaldBedrag: true, status: true } },
      expenses: { select: { totaalBedrag: true } },
    },
  });

  return projecten.map((p) => ({
    ...p,
    totaalOffertes: p.offertes.reduce((sum, o) => sum + o.totaal, 0),
    totaalFacturen: p.facturen.reduce((sum, f) => sum + f.totaal, 0),
    totaalBetaald: p.facturen.reduce((sum, f) => sum + f.betaaldBedrag, 0),
    totaalKosten: p.expenses.reduce((sum, e) => sum + e.totaalBedrag, 0),
    aantalOffertes: p.offertes.length,
    aantalFacturen: p.facturen.length,
  }));
}

export default async function ProjectenPage() {
  const projecten = await getProjecten();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projecten</h1>
          <p className="text-muted-foreground">
            Beheer uw projecten en bekijk de voortgang
          </p>
        </div>
        <Link href="/projecten/nieuw">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuw Project
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Projecten</CardTitle>
          <CardDescription>
            {projecten.length} project{projecten.length !== 1 ? "en" : ""} in totaal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nummer</TableHead>
                <TableHead>Naam</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Locatie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Offertes</TableHead>
                <TableHead className="text-right">Gefactureerd</TableHead>
                <TableHead className="text-right">Kosten</TableHead>
                <TableHead className="text-right">Winst</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projecten.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">Geen projecten gevonden</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Maak een project aan om werk te organiseren</p>
                  </TableCell>
                </TableRow>
              ) : (
                projecten.map((project) => {
                  const winst = project.totaalFacturen - project.totaalKosten;
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-sm">{project.projectNummer}</TableCell>
                      <TableCell className="font-medium">{project.naam}</TableCell>
                      <TableCell>
                        <Link href={`/klanten/${project.klant.id}`} className="text-blue-600 hover:underline">
                          {project.klant.naam}
                        </Link>
                      </TableCell>
                      <TableCell>{project.locatie || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{project.aantalOffertes}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(project.totaalFacturen)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(project.totaalKosten)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${winst >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(winst)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Link href={`/projecten/${project.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
