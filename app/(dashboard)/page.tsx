import { getSession } from "@/lib/simple-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, FileText, Receipt, Users } from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Parallel fetch all data for maximum speed
  const [
    facturenDezeMaand,
    openstaandeFacturen,
    offerteCount,
    klantenCount,
    recentOffertes,
    recentFacturen,
  ] = await Promise.all([
    // Get revenue this month - only select needed fields
    prisma.factuur.findMany({
      where: {
        datum: {
          gte: currentMonth,
          lt: nextMonth,
        },
      },
      select: {
        totaal: true,
      },
    }),
    // Get outstanding invoices - only select needed fields
    prisma.factuur.findMany({
      where: {
        status: {
          in: ["Onbetaald", "Achterstallig", "Gedeeltelijk betaald"],
        },
      },
      select: {
        totaal: true,
        betaaldBedrag: true,
      },
    }),
    // Get sent quotations count
    prisma.offerte.count({
      where: {
        status: "Verzonden",
      },
    }),
    // Get client count
    prisma.klant.count(),
    // Get recent quotations - only select needed fields
    prisma.offerte.findMany({
      take: 5,
      orderBy: { datum: "desc" },
      select: {
        id: true,
        offerteNummer: true,
        totaal: true,
        status: true,
        klant: {
          select: {
            naam: true,
          },
        },
      },
    }),
    // Get recent invoices - only select needed fields
    prisma.factuur.findMany({
      take: 5,
      orderBy: { datum: "desc" },
      select: {
        id: true,
        factuurNummer: true,
        totaal: true,
        status: true,
        klant: {
          select: {
            naam: true,
          },
        },
      },
    }),
  ]);

  const omzetDezeMaand = facturenDezeMaand.reduce((sum, f) => sum + f.totaal, 0);
  const openstaandBedrag = openstaandeFacturen.reduce(
    (sum, f) => sum + (f.totaal - f.betaaldBedrag),
    0
  );

  return {
    omzetDezeMaand,
    openstaandBedrag,
    offerteCount,
    klantenCount,
    recentOffertes,
    recentFacturen,
  };
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "Betaald":
    case "Geaccepteerd":
      return "success" as const;
    case "Verzonden":
      return "default" as const;
    case "Concept":
      return "secondary" as const;
    case "Onbetaald":
      return "warning" as const;
    case "Achterstallig":
    case "Afgewezen":
      return "destructive" as const;
    default:
      return "default" as const;
  }
}

// Enable Next.js caching for 60 seconds
export const revalidate = 60;

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overzicht van uw bedrijfsactiviteiten
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Omzet Deze Maand
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.omzetDezeMaand)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Openstaande Facturen
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.openstaandBedrag)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verzonden Offertes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.offerteCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aantal Klanten
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.klantenCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Snelle Acties</CardTitle>
          <CardDescription>
            Veelgebruikte acties voor dagelijks gebruik
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/offertes/nieuw">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Nieuwe Offerte
            </Button>
          </Link>
          <Link href="/facturen/nieuw">
            <Button>
              <Receipt className="mr-2 h-4 w-4" />
              Nieuwe Factuur
            </Button>
          </Link>
          <Link href="/klanten/nieuw">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Nieuwe Klant
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Quotations */}
        <Card>
          <CardHeader>
            <CardTitle>Recente Offertes</CardTitle>
            <CardDescription>
              De laatste 5 aangemaakte offertes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nummer</TableHead>
                  <TableHead>Klant</TableHead>
                  <TableHead>Bedrag</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOffertes.map((offerte) => (
                  <TableRow key={offerte.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/offertes/${offerte.id}`}
                        className="hover:underline"
                      >
                        {offerte.offerteNummer}
                      </Link>
                    </TableCell>
                    <TableCell>{offerte.klant.naam}</TableCell>
                    <TableCell>{formatCurrency(offerte.totaal)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(offerte.status)}>
                        {offerte.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recente Facturen</CardTitle>
            <CardDescription>
              De laatste 5 aangemaakte facturen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nummer</TableHead>
                  <TableHead>Klant</TableHead>
                  <TableHead>Bedrag</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentFacturen.map((factuur) => (
                  <TableRow key={factuur.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/facturen/${factuur.id}`}
                        className="hover:underline"
                      >
                        {factuur.factuurNummer}
                      </Link>
                    </TableCell>
                    <TableCell>{factuur.klant.naam}</TableCell>
                    <TableCell>{formatCurrency(factuur.totaal)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(factuur.status)}>
                        {factuur.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

