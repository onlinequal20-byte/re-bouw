"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentButtonProps {
  factuurId: string;
  factuurNummer: string;
  remainingAmount: number;
  status: string;
}

export function PaymentButton({
  factuurId,
  factuurNummer,
  remainingAmount,
  status,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Don't show button if already paid
  if (status === "Betaald" || remainingAmount <= 0) {
    return null;
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/facturen/${factuurId}/betalen`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Betaling aanmaken mislukt");
      }

      const data = await response.json();

      // Redirect to Mollie payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Geen betaal-URL ontvangen");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Fout",
        description:
          error.message === "Mollie API key not configured"
            ? "Mollie is nog niet geconfigureerd. Neem contact op met de beheerder."
            : error.message || "Er is een fout opgetreden bij het aanmaken van de betaling.",
      });
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={loading} size="lg" className="w-full sm:w-auto">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Betaling voorbereiden...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Betaal met iDEAL
        </>
      )}
    </Button>
  );
}

