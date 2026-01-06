import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OffertePaymentButton } from "@/components/offerte-payment-button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function PublicOffertePaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offerte = await prisma.offerte.findUnique({
    where: { id },
    include: {
      klant: true,
      items: {
        orderBy: { volgorde: "asc" },
      },
    },
  });

  if (!offerte) {
    notFound();
  }

  const prepaymentAmount = offerte.totaal * 0.3; // 30% prepayment
  const isPaid = offerte.status === "Geaccepteerd" && offerte.vooruitbetaald;

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Offerte {offerte.offerteNummer}
          </CardTitle>
          <CardDescription>
            {offerte.projectNaam} - {offerte.klant.naam}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Badge variant={getStatusBadgeVariant(offerte.status)} className="text-lg px-4 py-2">
              {offerte.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Offerte Details</h3>
              <p><strong>Datum:</strong> {formatDate(offerte.datum)}</p>
              <p><strong>Geldig tot:</strong> {formatDate(offerte.geldigTot)}</p>
              <p><strong>Totaalbedrag:</strong> {formatCurrency(offerte.totaal)}</p>
              <p className="text-xl font-bold mt-2 text-blue-600">
                Vooruitbetaling (30%): {formatCurrency(prepaymentAmount)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Klant Gegevens</h3>
              <p><strong>Naam:</strong> {offerte.klant.naam}</p>
              <p><strong>Email:</strong> {offerte.klant.email}</p>
              <p><strong>Adres:</strong> {offerte.klant.adres}, {offerte.klant.postcode} {offerte.klant.plaats}</p>
            </div>
          </div>

          {offerte.status === "Geaccepteerd" && !isPaid && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Vooruitbetaling</h3>
              <div className="rounded-lg bg-blue-50 p-4 text-sm">
                <p className="mb-2">
                  ✓ Deze offerte is geaccepteerd en ondertekend
                </p>
                <p className="mb-2">
                  ✓ Betaal 30% vooruit om het project te starten
                </p>
                <p>
                  ✓ Restbedrag ({formatCurrency(offerte.totaal - prepaymentAmount)}) wordt gefactureerd na oplevering
                </p>
              </div>
              <OffertePaymentButton
                offerteId={offerte.id}
                offerteStatus={offerte.status}
                prepaymentAmount={prepaymentAmount}
                isPaid={isPaid}
              />
              <div className="text-sm text-muted-foreground mt-4">
                <p>U kunt ook handmatig overmaken naar:</p>
                <p><strong>IBAN:</strong> NL91ABNA0417164300</p>
                <p><strong>T.n.v.:</strong> AMS Bouwers B.V.</p>
                <p><strong>Onder vermelding van:</strong> {offerte.offerteNummer} - Vooruitbetaling</p>
              </div>
            </div>
          )}

          {offerte.status !== "Geaccepteerd" && (
            <div className="text-center text-orange-600 font-semibold text-lg">
              ⚠️ Deze offerte moet eerst worden ondertekend voordat u kunt betalen.
            </div>
          )}

          {isPaid && (
            <div className="text-center text-green-600 font-semibold text-xl flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6" /> Vooruitbetaling is ontvangen!
            </div>
          )}

          <div className="text-center mt-6">
            <Link href="/">
              <Button variant="outline">Terug naar de website</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

