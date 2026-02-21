"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface EmailButtonProps {
  id: string;
  type: "offerte" | "factuur";
  clientEmail?: string | null;
  disabled?: boolean;
}

export function EmailButton({ id, type, clientEmail, disabled }: EmailButtonProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!clientEmail) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Deze klant heeft geen emailadres ingesteld.",
      });
      return;
    }

    setSending(true);
    try {
      const endpoint = type === "offerte" 
        ? `/api/offertes/${id}/email`
        : `/api/facturen/${id}/email`;

      const response = await fetch(endpoint, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "E-mail verzenden mislukt");
      }

      toast({
        title: "Email verzonden!",
        description: `De ${type} is succesvol verzonden naar ${clientEmail}`,
      });

      setOpen(false);
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error: any) {
      console.error("Error sending email:", error);
      
      let errorMessage = "Er is een fout opgetreden bij het versturen van de email.";
      
      if (error.message.includes("credentials not configured")) {
        errorMessage = "Zoho Mail is nog niet geconfigureerd. Ga naar Instellingen → Zoho Mail om je credentials in te stellen.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Fout",
        description: errorMessage,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled || !clientEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Verstuur Email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email Versturen</DialogTitle>
          <DialogDescription>
            Weet je zeker dat je deze {type} wilt versturen naar {clientEmail}?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              <strong>Ontvanger:</strong> {clientEmail}
            </p>
            <p className="text-sm mt-2">
              De {type} wordt als PDF bijlage meegestuurd en een kopie wordt gestuurd naar info@re-bouw.nl
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
              Annuleren
            </Button>
            <Button onClick={handleSendEmail} disabled={sending}>
              {sending ? "Versturen..." : "Verstuur Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

