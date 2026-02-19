"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Bell, Loader2, ChevronDown } from "lucide-react";

const TONES = [
  { value: "vriendelijk", label: "Vriendelijk", description: "Beleefde herinnering" },
  { value: "zakelijk", label: "Zakelijk", description: "Dringende herinnering" },
  { value: "laatste", label: "Laatste aanmaning", description: "Laatste waarschuwing" },
] as const;

export function FactuurReminderButton({ factuurId }: { factuurId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendReminder = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/facturen/${factuurId}/herinnering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bell className="mr-2 h-4 w-4" />
          )}
          Herinnering
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {TONES.map((tone) => (
          <DropdownMenuItem
            key={tone.value}
            onClick={() => sendReminder(tone.value)}
          >
            <div>
              <p className="font-medium">{tone.label}</p>
              <p className="text-xs text-muted-foreground">{tone.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
