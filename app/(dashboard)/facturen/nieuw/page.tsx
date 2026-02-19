"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, PenLine, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import FactuurEditor from "@/components/factuur-editor/factuur-editor";

type View = "selection" | "offerte-picker" | "editor";

interface InitialData {
  offerteId: string;
  klantId: string;
  projectId?: string;
  projectNaam: string;
  projectLocatie?: string;
  items: {
    omschrijving: string;
    aantal: number;
    eenheid: string;
    prijsPerEenheid: number;
    totaal: number;
    btwTarief: string;
    btwBedrag: number;
  }[];
  subtotaal: number;
  btwBedrag: number;
  totaal: number;
  notities?: string;
}

function transformOfferte(offerte: any): InitialData {
  return {
    offerteId: offerte.id,
    klantId: offerte.klantId,
    projectId: offerte.projectId,
    projectNaam: offerte.projectNaam,
    projectLocatie: offerte.projectLocatie,
    items: offerte.items.map((item: any) => ({
      omschrijving: item.omschrijving,
      aantal: item.aantal,
      eenheid: item.eenheid,
      prijsPerEenheid: item.prijsPerEenheid,
      totaal: item.totaal,
      btwTarief: item.btwTarief,
      btwBedrag: item.btwBedrag,
    })),
    subtotaal: offerte.subtotaal,
    btwBedrag: offerte.btwBedrag,
    totaal: offerte.totaal,
    notities: offerte.notities,
  };
}

function NieuweFactuurContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>("selection");
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [offertes, setOffertes] = useState<any[]>([]);
  const [loadingOffertes, setLoadingOffertes] = useState(false);
  const [loadingOfferte, setLoadingOfferte] = useState(false);

  const fetchAndSetOfferte = useCallback(async (offerteId: string) => {
    setLoadingOfferte(true);
    try {
      const res = await fetch(`/api/offertes/${offerteId}`);
      if (!res.ok) throw new Error("Failed to fetch offerte");
      const offerte = await res.json();
      setInitialData(transformOfferte(offerte));
      setView("editor");
    } catch (error) {
      console.error("Error fetching offerte:", error);
    } finally {
      setLoadingOfferte(false);
    }
  }, []);

  // Handle ?offerteId query param
  useEffect(() => {
    const offerteId = searchParams.get("offerteId");
    if (offerteId) {
      fetchAndSetOfferte(offerteId);
    }
  }, [searchParams, fetchAndSetOfferte]);

  const openOffertePicker = async () => {
    setView("offerte-picker");
    setLoadingOffertes(true);
    try {
      const res = await fetch("/api/offertes");
      if (!res.ok) throw new Error("Failed to fetch offertes");
      const data = await res.json();
      // Filter: only signed offertes without an existing factuur
      const eligible = data.filter(
        (o: any) => o.status === "Getekend" && (!o.facturen || o.facturen.length === 0)
      );
      setOffertes(eligible);
    } catch (error) {
      console.error("Error fetching offertes:", error);
    } finally {
      setLoadingOffertes(false);
    }
  };

  const selectOfferte = async (offerte: any) => {
    await fetchAndSetOfferte(offerte.id);
  };

  // Loading state for direct offerteId param
  if (loadingOfferte && view !== "editor") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // View 3: Editor
  if (view === "editor") {
    return <FactuurEditor initialData={initialData} />;
  }

  // View 2: Offerte Picker
  if (view === "offerte-picker") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setView("selection")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kies een offerte</h1>
            <p className="text-muted-foreground">
              Selecteer een getekende offerte om te factureren
            </p>
          </div>
        </div>

        {loadingOffertes ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : offertes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Geen getekende offertes zonder factuur gevonden
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offertes.map((offerte) => (
              <Card
                key={offerte.id}
                className="cursor-pointer transition-all hover:scale-[1.02] hover:border-primary"
                onClick={() => selectOfferte(offerte)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{offerte.offerteNummer}</CardTitle>
                  <CardDescription>{offerte.klant?.naam}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="text-muted-foreground">{offerte.projectNaam}</p>
                  <p className="text-muted-foreground">
                    {new Date(offerte.datum).toLocaleDateString("nl-NL")}
                  </p>
                  <p className="text-lg font-semibold">{formatCurrency(offerte.totaal)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View 1: Selection
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/facturen">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nieuwe Factuur</h1>
          <p className="text-muted-foreground">
            Kies hoe je de factuur wilt aanmaken
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
        <Card
          className="cursor-pointer transition-all hover:scale-[1.02] hover:border-primary"
          onClick={openOffertePicker}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Vanuit Offerte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Maak een factuur op basis van een getekende offerte
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:scale-[1.02] hover:border-primary"
          onClick={() => {
            setInitialData(null);
            setView("editor");
          }}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <PenLine className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Handmatig</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Maak een factuur helemaal zelf
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NieuweFactuurPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NieuweFactuurContent />
    </Suspense>
  );
}
