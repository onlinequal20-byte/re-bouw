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
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Klanten</h1>
          <p className="text-muted-foreground">
            Beheer uw klanten en contactgegevens
          </p>
        </div>
        <Link href="/klanten/nieuw">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Klant
          </Button>
        </Link>
      </div>

      <Card>
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
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Geen klanten gevonden
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
                          {/* 
                          <Link href={`/klanten/${klant.id}/bewerken`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          */}
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
