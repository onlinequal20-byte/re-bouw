"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = 'force-dynamic';

function StatusContent() {
  const searchParams = useSearchParams();
  const factuurId = searchParams.get("factuurId");
  const offerteId = searchParams.get("offerteId");
  const type = searchParams.get("type");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [documentNummer, setDocumentNummer] = useState<string>("");

  useEffect(() => {
    if (!factuurId && !offerteId) {
      setStatus("failed");
      return;
    }

    // Check payment status
    const checkStatus = async () => {
      try {
        const isOfferte = type === "offerte" || offerteId;
        const documentId = isOfferte ? offerteId : factuurId;
        const endpoint = isOfferte ? "offertes" : "facturen";
        
        const response = await fetch(`/api/${endpoint}/${documentId}?public=true`);
        if (response.ok) {
          const data = await response.json();
          setDocumentNummer(isOfferte ? data.offerteNummer : data.factuurNummer);
          
          const isPaid = isOfferte 
            ? data.vooruitbetaald === true
            : data.status === "Betaald";
          
          if (isPaid) {
            setStatus("success");
          } else {
            // Wait a bit and check again (payment might still be processing)
            setTimeout(async () => {
              const retryResponse = await fetch(`/api/${endpoint}/${documentId}?public=true`);
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                const retryPaid = isOfferte
                  ? retryData.vooruitbetaald === true
                  : retryData.status === "Betaald";
                
                if (retryPaid) {
                  setStatus("success");
                } else {
                  setStatus("failed");
                }
              } else {
                setStatus("failed");
              }
            }, 3000);
          }
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Error checking status:", error);
        setStatus("failed");
      }
    };

    checkStatus();
  }, [factuurId, offerteId, type]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Betaling verwerken...</h1>
            <p className="text-gray-600 mb-6">
              Even geduld, we controleren de status van uw betaling.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Betaling geslaagd!
            </h1>
            <p className="text-gray-600 mb-2">
              Uw betaling is succesvol verwerkt.
            </p>
            {documentNummer && (
              <p className="text-sm text-gray-500 mb-6">
                {type === "offerte" ? "Offertenummer" : "Factuurnummer"}: {documentNummer}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-6">
              U ontvangt een bevestiging per e-mail.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">Terug naar de website</Link>
              </Button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Betaling mislukt
            </h1>
            <p className="text-gray-600 mb-6">
              De betaling kon niet worden verwerkt. Dit kan verschillende redenen hebben:
            </p>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-1">
              <li>• Betaling is geannuleerd</li>
              <li>• Onvoldoende saldo</li>
              <li>• Technische storing</li>
            </ul>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">Terug naar de website</Link>
              </Button>
              {(factuurId || offerteId) && (
                <Button asChild variant="outline" className="w-full">
                  <Link href={factuurId ? `/facturen/${factuurId}` : `/offertes/${offerteId}`}>
                    Probeer opnieuw
                  </Link>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BetalingStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold mb-2">Laden...</h1>
        </div>
      </div>
    }>
      <StatusContent />
    </Suspense>
  );
}
