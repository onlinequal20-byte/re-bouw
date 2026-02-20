import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const revalidate = 30;
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
import { Plus, Eye, Edit, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

async function getKlanten() {
  const klanten = await prisma.klant.findMany({
    orderBy: { naam: "asc" },
    include: {
      offertes: true,
      facturen: true,
      expenses: true,
    },
  });

  return klanten.map((klant) => ({
    ...klant,
    aantalOffertes: klant.offertes.length,
    totaalFacturen: klant.facturen.reduce((sum, f) => sum + f.totaal, 0),
    totaalExpenses: klant.expenses.reduce((sum, e) => sum + e.totaalBedrag, 0),
  }));
}

export default async function KlantenPage() {
  const klanten = await getKlanten();

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">Klanten</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Beheer uw klanten en contactgegevens
          </p>
        </div>
        <Link href="/klanten/nieuw">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nieuwe Klant</span>
            <span className="sm:hidden">Nieuw</span>
          </Button>
        </Link>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {klanten.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground font-medium">Geen klanten gevonden</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Voeg je eerste klant toe om te beginnen</p>
            </CardContent>
          </Card>
        ) : (
          klanten.map((klant) => {
            const winst = klant.totaalFacturen - klant.totaalExpenses;
            return (
              <Link key={klant.id} href={`/klanten/${klant.id}`}>
                <Card className="active:scale-[0.98] transition-transform">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{klant.naam}</p>
                        <p className="text-sm text-muted-foreground">{klant.plaats || "—"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-green-600 font-medium">{formatCurrency(klant.totaalFacturen)}</p>
                        <p className={`text-sm font-bold ${winst >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatCurrency(winst)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Alle Klanten</CardTitle>
          <CardDescription>
            {klanten.length} klant{klanten.length !== 1 ? "en" : ""} in totaal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefoon</TableHead>
                <TableHead>Plaats</TableHead>
                <TableHead className="text-right">Offertes</TableHead>
                <TableHead className="text-right">Omzet</TableHead>
                <TableHead className="text-right">Kosten</TableHead>
                <TableHead className="text-right">Winst</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {klanten.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">Geen klanten gevonden</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Voeg je eerste klant toe om te beginnen</p>
                  </TableCell>
                </TableRow>
              ) : (
                klanten.map((klant) => {
                  const winst = klant.totaalFacturen - klant.totaalExpenses;
                  return (
                    <TableRow key={klant.id}>
                      <TableCell className="font-medium">{klant.naam}</TableCell>
                      <TableCell>{klant.email || "-"}</TableCell>
                      <TableCell>{klant.telefoon || "-"}</TableCell>
                      <TableCell>{klant.plaats || "-"}</TableCell>
                      <TableCell className="text-right">{klant.aantalOffertes}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(klant.totaalFacturen)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(klant.totaalExpenses)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${winst >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(winst)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link href={`/klanten/${klant.id}`}>
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
