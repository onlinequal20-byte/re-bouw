"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface OffertePaymentButtonProps {
  offerteId: string;
  offerteStatus: string;
  prepaymentAmount: number;
  isPaid: boolean;
}

export function OffertePaymentButton({ 
  offerteId, 
  offerteStatus, 
  prepaymentAmount,
  isPaid 
}: OffertePaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/offertes/${offerteId}/betalen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fout bij aanmaken betaling");
      }

      const { checkoutUrl } = await response.json();
      router.push(checkoutUrl); // Redirect to Mollie checkout
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Betaling mislukt",
        description: error.message || "Er is een fout opgetreden bij het starten van de betaling.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isPaid || offerteStatus !== "Geaccepteerd") {
    return null; // Don't show button if already paid or not accepted
  }

  return (
    <Button onClick={handlePayment} disabled={loading} size="lg" className="w-full">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Betaling starten...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Betaal vooruitbetaling met iDEAL (€{prepaymentAmount.toFixed(2).replace('.', ',')})
        </>
      )}
    </Button>
  );
}

