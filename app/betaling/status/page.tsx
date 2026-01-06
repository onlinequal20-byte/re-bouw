"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BetalingStatusPage() {
  const searchParams = useSearchParams();
  const factuurId = searchParams.get("factuurId");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [factuurNummer, setFactuurNummer] = useState<string>("");

  useEffect(() => {
    if (!factuurId) {
      setStatus("failed");
      return;
    }

    // Check payment status
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/facturen/${factuurId}`);
        if (response.ok) {
          const data = await response.json();
          setFactuurNummer(data.factuurNummer);
          
          if (data.status === "Betaald") {
            setStatus("success");
          } else {
            // Wait a bit and check again (payment might still be processing)
            setTimeout(async () => {
              const retryResponse = await fetch(`/api/facturen/${factuurId}`);
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                if (retryData.status === "Betaald") {
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
  }, [factuurId]);

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
            {factuurNummer && (
              <p className="text-sm text-gray-500 mb-6">
                Factuurnummer: {factuurNummer}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-6">
              U ontvangt een bevestiging per e-mail.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">Terug naar dashboard</Link>
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
                <Link href="/">Terug naar dashboard</Link>
              </Button>
              {factuurId && (
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/facturen/${factuurId}`}>Probeer opnieuw</Link>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

