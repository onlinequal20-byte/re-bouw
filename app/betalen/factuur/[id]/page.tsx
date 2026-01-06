"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, Loader2, CheckCircle, Building2, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PublicBetaalPage() {
  const params = useParams();
  const id = params.id as string;
  const [factuur, setFactuur] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchFactuur = async () => {
      try {
        const response = await fetch(`/api/facturen/${id}?public=true`);
        if (response.ok) {
          const data = await response.json();
          setFactuur(data);
        } else {
          toast({
            variant: "destructive",
            title: "Fout",
            description: "Factuur niet gevonden",
          });
        }
      } catch (error) {
        console.error("Error fetching factuur:", error);
        toast({
          variant: "destructive",
          title: "Fout",
          description: "Er is een fout opgetreden bij het laden van de factuur",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFactuur();
  }, [id, toast]);

  const handlePayment = async () => {
    setPaying(true);
    try {
      const response = await fetch(`/api/facturen/${id}/betalen?public=true`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create payment");
      }

      const data = await response.json();

      // Redirect to Mollie payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Fout",
        description:
          error.message === "Mollie API key not configured"
            ? "Online betalingen zijn momenteel niet beschikbaar. Neem contact op met het bedrijf."
            : error.message || "Er is een fout opgetreden bij het aanmaken van de betaling.",
      });
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Factuur laden...</p>
        </div>
      </div>
    );
  }

  if (!factuur) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Factuur niet gevonden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              De opgevraagde factuur kon niet worden gevonden.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const remainingAmount = factuur.totaal - factuur.betaaldBedrag;
  const isPaid = factuur.status === "Betaald" || remainingAmount <= 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Factuur Betalen
          </h1>
          <p className="text-gray-600">
            AMS Bouwers B.V.
          </p>
        </div>

        {/* Invoice Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {factuur.factuurNummer}
              </CardTitle>
              <Badge variant={isPaid ? "success" : "warning"}>
                {factuur.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="h-4 w-4 mr-2" />
                  Project
                </div>
                <p className="font-medium">{factuur.projectNaam}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Building2 className="h-4 w-4 mr-2" />
                  Klant
                </div>
                <p className="font-medium">{factuur.klant.naam}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Factuurdatum
                </div>
                <p className="font-medium">{formatDate(factuur.datum)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Vervaldatum
                </div>
                <p className="font-medium">{formatDate(factuur.vervaldatum)}</p>
              </div>
            </div>

            {/* Amounts */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Totaalbedrag:</span>
                <span className="font-semibold">{formatCurrency(factuur.totaal)}</span>
              </div>
              {factuur.betaaldBedrag > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Reeds betaald:</span>
                  <span>{formatCurrency(factuur.betaaldBedrag)}</span>
                </div>
              )}
              {!isPaid && (
                <div className="flex justify-between text-xl font-bold text-blue-600 border-t pt-2">
                  <span>Te betalen:</span>
                  <span>{formatCurrency(remainingAmount)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        {isPaid ? (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Factuur is betaald
                </h3>
                <p className="text-green-700">
                  Deze factuur is reeds volledig betaald.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Betalen met iDEAL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Veilig online betalen
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Betaal direct met uw eigen bank</li>
                  <li>✓ Veilig via Mollie betalingen</li>
                  <li>✓ Directe bevestiging na betaling</li>
                  <li>✓ Geen extra kosten</li>
                </ul>
              </div>

              <Button
                onClick={handlePayment}
                disabled={paying}
                size="lg"
                className="w-full"
              >
                {paying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Betaling voorbereiden...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Betaal {formatCurrency(remainingAmount)} met iDEAL
                  </>
                )}
              </Button>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 text-center mb-2">
                  Of betaal via bankoverschrijving:
                </p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">IBAN:</span>
                    <span className="font-mono">NL91 ABNA 0417 1643 00</span>
                    <span className="text-gray-600">T.n.v.:</span>
                    <span>AMS Bouwers B.V.</span>
                    <span className="text-gray-600">Onder vermelding van:</span>
                    <span className="font-medium">{factuur.factuurNummer}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Vragen over deze factuur?</p>
          <p className="mt-1">
            Neem contact op via{" "}
            <a href="mailto:info@amsbouwers.nl" className="text-blue-600 hover:underline">
              info@amsbouwers.nl
            </a>{" "}
            of{" "}
            <a href="tel:0642959565" className="text-blue-600 hover:underline">
              06-42959565
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

