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
import { ArrowLeft, FolderOpen, FileText, Receipt, Mail } from "lucide-react";
import Link from "next/link";
import { InlineNotities } from "./inline-notities";

export default async function KlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const klant = await prisma.klant.findUnique({
    where: { id },
    include: {
      projecten: { orderBy: { createdAt: "desc" } },
      offertes: { orderBy: { datum: "desc" } },
      facturen: { orderBy: { datum: "desc" } },
      expenses: { orderBy: { datum: "desc" } },
    },
  });

  if (!klant) {
    notFound();
  }

  // Get emails for this klant's documents
  const documentIds = [
    ...klant.offertes.map(o => o.id),
    ...klant.facturen.map(f => f.id),
  ];

  const emails = documentIds.length > 0
    ? await prisma.email.findMany({
        where: { documentId: { in: documentIds } },
        orderBy: { sentAt: "desc" },
        take: 20,
      })
    : [];

  const totaalFacturen = klant.facturen.reduce((sum, f) => sum + f.totaal, 0);
  const totaalBetaald = klant.facturen.reduce((sum, f) => sum + f.betaaldBedrag, 0);
  const openstaand = totaalFacturen - totaalBetaald;
  const totaalKosten = klant.expenses.reduce((sum, e) => sum + e.totaalBedrag, 0);

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/klanten">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">{klant.naam}</h1>
          <p className="text-sm md:text-base text-muted-foreground">Klantdossier</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gefactureerd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">{formatCurrency(totaalFacturen)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Openstaand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg md:text-2xl font-bold ${openstaand > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {formatCurrency(openstaand)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kosten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">{formatCurrency(totaalKosten)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Winst</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg md:text-2xl font-bold ${(totaalFacturen - totaalKosten) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(totaalFacturen - totaalKosten)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Klant Info + Notities */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contactgegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {klant.email && (
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{klant.email}</p>
              </div>
            )}
            {klant.telefoon && (
              <div>
                <span className="text-sm text-muted-foreground">Telefoon:</span>
                <p className="font-medium">{klant.telefoon}</p>
              </div>
            )}
            {klant.adres && (
              <div>
                <span className="text-sm text-muted-foreground">Adres:</span>
                <p className="font-medium">{klant.adres}</p>
                {klant.postcode && klant.plaats && (
                  <p className="font-medium">{klant.postcode} {klant.plaats}</p>
                )}
              </div>
            )}
            {klant.kvkNummer && (
              <div>
                <span className="text-sm text-muted-foreground">KvK:</span>
                <p className="font-medium">{klant.kvkNummer}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notities</CardTitle>
          </CardHeader>
          <CardContent>
            <InlineNotities klantId={klant.id} initialNotities={klant.notities || ""} />
          </CardContent>
        </Card>
      </div>

      {/* Projecten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Projecten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {klant.projecten.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Geen projecten</p>
          ) : (
            <>
              <div className="md:hidden space-y-3">
                {klant.projecten.map((project) => (
                  <Link key={project.id} href={`/projecten/${project.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{project.naam}</p>
                            <p className="text-xs text-muted-foreground font-mono">{project.projectNummer}</p>
                          </div>
                          <Badge variant={project.status === "Actief" ? "success" : project.status === "Geannuleerd" ? "destructive" : "secondary"}>
                            {project.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nummer</TableHead>
                      <TableHead>Naam</TableHead>
                      <TableHead>Locatie</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {klant.projecten.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Link href={`/projecten/${project.id}`} className="text-blue-600 hover:underline font-mono text-sm">
                            {project.projectNummer}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium">{project.naam}</TableCell>
                        <TableCell>{project.locatie || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={project.status === "Actief" ? "success" : project.status === "Geannuleerd" ? "destructive" : "secondary"}>
                            {project.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Offertes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Offertes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {klant.offertes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Geen offertes</p>
          ) : (
            <>
              <div className="md:hidden space-y-3">
                {klant.offertes.map((offerte) => (
                  <Link key={offerte.id} href={`/offertes/${offerte.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-mono text-sm">{offerte.offerteNummer}</p>
                          <Badge variant={offerte.status === "Geaccepteerd" ? "success" : offerte.status === "Afgewezen" ? "destructive" : "secondary"}>
                            {offerte.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{formatDate(offerte.datum)}</p>
                          <p className="font-medium">{formatCurrency(offerte.totaal)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nummer</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Totaal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {klant.offertes.map((offerte) => (
                      <TableRow key={offerte.id}>
                        <TableCell>
                          <Link href={`/offertes/${offerte.id}`} className="text-blue-600 hover:underline font-mono text-sm">
                            {offerte.offerteNummer}
                          </Link>
                        </TableCell>
                        <TableCell>{offerte.projectNaam}</TableCell>
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
              </div>
            </>
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
          {klant.facturen.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Geen facturen</p>
          ) : (
            <>
              <div className="md:hidden space-y-3">
                {klant.facturen.map((factuur) => (
                  <Link key={factuur.id} href={`/facturen/${factuur.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-mono text-sm">{factuur.factuurNummer}</p>
                          <Badge variant={factuur.status === "Betaald" ? "success" : factuur.status === "Achterstallig" ? "destructive" : "default"}>
                            {factuur.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{formatDate(factuur.datum)}</p>
                          <p className="font-medium">{formatCurrency(factuur.totaal)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nummer</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Totaal</TableHead>
                      <TableHead className="text-right">Betaald</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {klant.facturen.map((factuur) => (
                      <TableRow key={factuur.id}>
                        <TableCell>
                          <Link href={`/facturen/${factuur.id}`} className="text-blue-600 hover:underline font-mono text-sm">
                            {factuur.factuurNummer}
                          </Link>
                        </TableCell>
                        <TableCell>{factuur.projectNaam}</TableCell>
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
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Communicatie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Communicatie
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Geen emails verzonden</p>
          ) : (
            <>
              <div className="md:hidden space-y-3">
                {emails.map((email) => (
                  <Card key={email.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm capitalize font-medium">{email.type}</p>
                        <Badge variant={email.status === "verzonden" ? "success" : "destructive"}>
                          {email.status}
                        </Badge>
                      </div>
                      <p className="text-sm truncate">{email.subject}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(email.sentAt)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Onderwerp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell>{formatDate(email.sentAt)}</TableCell>
                        <TableCell className="capitalize">{email.type}</TableCell>
                        <TableCell className="font-mono text-sm">{email.documentNummer}</TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>
                          <Badge variant={email.status === "verzonden" ? "success" : "destructive"}>
                            {email.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
