"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, Loader2 } from "lucide-react";

export function ReminderButton({ offerteId }: { offerteId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendReminder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/offertes/${offerteId}/herinnering`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fout bij versturen");
      }
      toast({
        title: "Herinnering verzonden",
        description: "De herinnering is succesvol verstuurd naar de klant.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: error.message || "Kon herinnering niet versturen.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={sendReminder} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Bell className="mr-2 h-4 w-4" />
      )}
      Herinnering
    </Button>
  );
}
