"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export function InlineNotities({ klantId, initialNotities }: { klantId: string; initialNotities: string }) {
  const [notities, setNotities] = useState(initialNotities);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/klanten/${klantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notities }),
      });

      if (!response.ok) throw new Error("Opslaan mislukt");

      toast({
        title: "Opgeslagen",
        description: "Notities zijn bijgewerkt.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Kon notities niet opslaan.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={notities}
        onChange={(e) => setNotities(e.target.value)}
        rows={4}
        placeholder="Notities over deze klant..."
      />
      <Button size="sm" onClick={handleSave} disabled={saving}>
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Opslaan..." : "Opslaan"}
      </Button>
    </div>
  );
}
