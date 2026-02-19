"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";

export default function AdminCleanupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [prijslijstCount, setPrijslijstCount] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/prijslijst")
      .then(res => res.json())
      .then(data => setPrijslijstCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setPrijslijstCount(0));
  }, []);

  const handleCleanup = async () => {
    if (!confirm("⚠️ WAARSCHUWING!\n\nDit verwijdert ALLE demo data:\n- Alle klanten\n- Alle offertes\n- Alle facturen\n- Alle bonnetjes\n\n✅ Prijslijst blijft behouden\n\nWeet je het zeker?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/clean-demo-data", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Cleanup failed");
      }

      setResult(data);
      toast({
        title: "✅ Cleanup succesvol!",
        description: "Alle demo data is verwijderd. Prijslijst behouden.",
      });

      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "❌ Cleanup mislukt",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-900 to-red-600 bg-clip-text text-transparent">
          ⚠️ Admin Cleanup
        </h1>
        <p className="text-muted-foreground mt-2">
          Verwijder alle demo data van de productie database
        </p>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Gevaarlijke Actie
          </CardTitle>
          <CardDescription>
            Deze actie kan niet ongedaan worden gemaakt!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold mb-2">Wat wordt verwijderd:</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500" />
                <span>Alle klanten</span>
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500" />
                <span>Alle offertes</span>
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500" />
                <span>Alle facturen</span>
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500" />
                <span>Alle bonnetjes/expenses</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold mb-2 text-green-700">Wat blijft behouden:</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Prijslijst ({prijslijstCount !== null ? `${prijslijstCount} items` : '...'})</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Gebruikersaccount</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Instellingen</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleCleanup}
            disabled={loading}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            {loading ? (
              "Bezig met verwijderen..."
            ) : (
              <>
                <Trash2 className="mr-2 h-5 w-5" />
                Verwijder Alle Demo Data
              </>
            )}
          </Button>

          {result && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold mb-2 text-green-700">✅ Cleanup Compleet!</h3>
              <ul className="space-y-1 text-sm">
                <li>Klanten verwijderd: {result.summary.klanten}</li>
                <li>Offertes verwijderd: {result.summary.offertes}</li>
                <li>Facturen verwijderd: {result.summary.facturen}</li>
                <li>Bonnetjes verwijderd: {result.summary.expenses}</li>
                <li>Prijslijst: {result.summary.prijslijst}</li>
              </ul>
              <p className="mt-3 text-green-600 font-semibold">
                Je wordt doorgestuurd naar het dashboard...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

