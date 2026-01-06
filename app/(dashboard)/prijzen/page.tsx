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
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { PriceDialog } from "@/components/price-dialog";

async function getPrijslijst() {
  return prisma.prijslijst.findMany({
    orderBy: [{ categorie: "asc" }, { omschrijving: "asc" }],
  });
}

export default async function PrijzenPage() {
  const prijslijst = await getPrijslijst();

  // Group by category
  const grouped = prijslijst.reduce((acc, item) => {
    if (!acc[item.categorie]) {
      acc[item.categorie] = [];
    }
    acc[item.categorie].push(item);
    return acc;
  }, {} as Record<string, typeof prijslijst>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prijslijst</h1>
          <p className="text-muted-foreground">
            Beheer uw standaard prijzen per categorie
          </p>
        </div>
        <PriceDialog />
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([categorie, items]) => (
          <Card key={categorie}>
            <CardHeader>
              <CardTitle>{categorie}</CardTitle>
              <CardDescription>
                {items.length} item{items.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Omschrijving</TableHead>
                    <TableHead className="text-right">Prijs per Eenheid</TableHead>
                    <TableHead>Eenheid</TableHead>
                    <TableHead className="text-right">Materiaalkosten</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.omschrijving}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.prijsPerEenheid)}
                      </TableCell>
                      <TableCell>{item.eenheid}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.materiaalKosten)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.actief ? "success" : "secondary"}>
                          {item.actief ? "Actief" : "Inactief"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <PriceDialog
                            price={item}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

