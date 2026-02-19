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

  const previousMonth = new Date(currentMonth);
  previousMonth.setMonth(previousMonth.getMonth() - 1);

  // Parallel fetch all data for maximum speed
  const [
    facturenDezeMaand,
    facturenVorigeMaand,
    openstaandeFacturen,
    offerteCount,
    klantenCount,
    recentOffertes,
    recentFacturen,
  ] = await Promise.all([
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
    prisma.factuur.findMany({
      where: {
        datum: {
          gte: previousMonth,
          lt: currentMonth,
        },
      },
      select: {
        totaal: true,
      },
    }),
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
    prisma.offerte.count({
      where: {
        status: "Verzonden",
      },
    }),
    prisma.klant.count(),
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
  const omzetVorigeMaand = facturenVorigeMaand.reduce((sum, f) => sum + f.totaal, 0);
  const omzetGroeiPercentage = omzetVorigeMaand > 0
    ? Math.round(((omzetDezeMaand - omzetVorigeMaand) / omzetVorigeMaand) * 100)
    : null;
  const openstaandBedrag = openstaandeFacturen.reduce(
    (sum, f) => sum + (f.totaal - f.betaaldBedrag),
    0
  );

  return {
    omzetDezeMaand,
    omzetGroeiPercentage,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 md:mt-2">
            Overzicht van uw bedrijfsactiviteiten
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        <Card className="card-enhanced border-l-4 border-l-primary hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Omzet Deze Maand
            </CardTitle>
            <div className="hidden md:flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-3xl font-bold text-primary">
              {formatCurrency(data.omzetDezeMaand)}
            </div>
            {data.omzetGroeiPercentage !== null ? (
              <p className={`text-xs mt-1 ${data.omzetGroeiPercentage >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {data.omzetGroeiPercentage >= 0 ? '+' : ''}{data.omzetGroeiPercentage}% vanaf vorige maand
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Eerste maand
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-enhanced border-l-4 border-l-orange-400 hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Openstaand
            </CardTitle>
            <div className="hidden md:flex h-10 w-10 rounded-full bg-orange-50 items-center justify-center">
              <Receipt className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-3xl font-bold text-orange-500">
              {formatCurrency(data.openstaandBedrag)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Te innen bedrag
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced border-l-4 border-l-blue-500 hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Verzonden Offertes
            </CardTitle>
            <div className="hidden md:flex h-10 w-10 rounded-full bg-blue-100 items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-3xl font-bold text-blue-600">{data.offerteCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Wachten op reactie
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced border-l-4 border-l-green-500 hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Aantal Klanten
            </CardTitle>
            <div className="hidden md:flex h-10 w-10 rounded-full bg-green-100 items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-3xl font-bold text-green-600">{data.klantenCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actieve klanten
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - full width on mobile */}
      <Card>
        <CardHeader>
          <CardTitle>Snelle Acties</CardTitle>
          <CardDescription className="hidden md:block">
            Veelgebruikte acties voor dagelijks gebruik
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href="/offertes/nieuw" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Nieuwe Offerte
            </Button>
          </Link>
          <Link href="/facturen/nieuw" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Receipt className="mr-2 h-4 w-4" />
              Nieuwe Factuur
            </Button>
          </Link>
          <Link href="/klanten/nieuw" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
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
            <CardDescription className="hidden md:block">
              De laatste 5 aangemaakte offertes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile list */}
            <div className="space-y-3 md:hidden">
              {data.recentOffertes.map((offerte) => (
                <Link key={offerte.id} href={`/offertes/${offerte.id}`} className="block">
                  <div className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{offerte.offerteNummer}</p>
                      <p className="text-xs text-muted-foreground truncate">{offerte.klant.naam}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-medium">{formatCurrency(offerte.totaal)}</p>
                      <Badge variant={getStatusBadgeVariant(offerte.status)} className="text-[10px]">
                        {offerte.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Desktop table */}
            <Table className="hidden md:table">
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
            <CardDescription className="hidden md:block">
              De laatste 5 aangemaakte facturen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile list */}
            <div className="space-y-3 md:hidden">
              {data.recentFacturen.map((factuur) => (
                <Link key={factuur.id} href={`/facturen/${factuur.id}`} className="block">
                  <div className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{factuur.factuurNummer}</p>
                      <p className="text-xs text-muted-foreground truncate">{factuur.klant.naam}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-medium">{formatCurrency(factuur.totaal)}</p>
                      <Badge variant={getStatusBadgeVariant(factuur.status)} className="text-[10px]">
                        {factuur.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Desktop table */}
            <Table className="hidden md:table">
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
