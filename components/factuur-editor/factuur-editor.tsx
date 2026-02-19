"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PrijslijstPanel from "@/components/offerte-editor/prijslijst-panel";
import FactuurPreviewPanel from "./preview-panel";
import ItemEditorPanel from "@/components/offerte-editor/item-editor-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Send, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface FactuurItemType {
  id: string;
  omschrijving: string;
  aantal: number;
  eenheid: string;
  prijsPerEenheid: number; // cents
  totaal: number; // cents
  btwTarief: string;
  notitie?: string;
}

interface FactuurEditorProps {
  initialData?: {
    offerteId: string;
    klantId: string;
    projectId?: string;
    projectNaam: string;
    projectLocatie?: string;
    items: Array<{
      omschrijving: string;
      aantal: number;
      eenheid: string;
      prijsPerEenheid: number; // cents
      totaal: number; // cents
      btwTarief: string;
      btwBedrag: number;
    }>;
    subtotaal: number;
    btwBedrag: number;
    totaal: number;
    notities?: string;
  };
}

const statusOpties = [
  { value: "Concept", label: "Concept" },
  { value: "Verzonden", label: "Verzonden" },
  { value: "Te laat", label: "Te laat" },
  { value: "Deels betaald", label: "Deels betaald" },
  { value: "Betaald", label: "Betaald" },
];

export default function FactuurEditor({ initialData }: FactuurEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Data fetched on mount
  const [klanten, setKlanten] = useState<any[]>([]);
  const [prijslijst, setPrijslijst] = useState<any[]>([]);
  const [projecten, setProjecten] = useState<any[]>([]);

  // Form fields (header/general info)
  const [klantId, setKlantId] = useState(initialData?.klantId ?? "");
  const [projectId, setProjectId] = useState(initialData?.projectId ?? "");
  const [projectNaam, setProjectNaam] = useState(
    initialData?.projectNaam ?? ""
  );
  const [projectLocatie, setProjectLocatie] = useState(
    initialData?.projectLocatie ?? ""
  );
  const [datum, setDatum] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [vervaldatum, setVervaldatum] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  );
  const [status, setStatus] = useState("Concept");
  const [notities, setNotities] = useState(initialData?.notities ?? "");
  const [offerteId] = useState(initialData?.offerteId ?? "");

  // Items
  const [items, setItems] = useState<FactuurItemType[]>(() => {
    if (initialData?.items) {
      return initialData.items.map((item) => ({
        id: Math.random().toString(36).substring(2, 11),
        omschrijving: item.omschrijving,
        aantal: item.aantal,
        eenheid: item.eenheid,
        prijsPerEenheid: item.prijsPerEenheid,
        totaal: item.totaal,
        btwTarief: item.btwTarief,
      }));
    }
    return [];
  });
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null
  );

  // UI
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  // Derived
  const selectedKlant = klanten.find((k) => k.id === klantId) || null;
  const selectedItem =
    selectedItemIndex !== null ? items[selectedItemIndex] ?? null : null;

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/klanten").then((r) => r.json()),
      fetch("/api/prijslijst").then((r) => r.json()),
      fetch("/api/projecten").then((r) => r.json()),
    ]).then(([klantenData, prijslijstData, projectenData]) => {
      setKlanten(Array.isArray(klantenData) ? klantenData : []);
      setPrijslijst(Array.isArray(prijslijstData) ? prijslijstData : []);
      setProjecten(Array.isArray(projectenData) ? projectenData : []);
    });
  }, []);

  // Add item from prijslijst
  const addItemFromPrijslijst = useCallback(
    (prijsItem: any) => {
      const newItem: FactuurItemType = {
        id: Math.random().toString(36).substring(2, 11),
        omschrijving: prijsItem.omschrijving,
        aantal: 1,
        eenheid: prijsItem.eenheid || "stuks",
        prijsPerEenheid: prijsItem.prijsPerEenheid,
        totaal: prijsItem.prijsPerEenheid,
        btwTarief: "HOOG_21",
      };
      setItems((prev) => {
        const next = [...prev, newItem];
        setSelectedItemIndex(next.length - 1);
        return next;
      });
    },
    []
  );

  // Update selected item
  const updateItem = useCallback(
    (
      updates: Partial<{
        omschrijving: string;
        aantal: number;
        eenheid: string;
        prijsPerEenheid: number;
        btwTarief: string;
        notitie: string;
      }>
    ) => {
      if (selectedItemIndex === null) return;
      setItems((prev) => {
        const next = [...prev];
        const current = { ...next[selectedItemIndex], ...updates };
        // Recalculate totaal when aantal or prijsPerEenheid changes
        if ("aantal" in updates || "prijsPerEenheid" in updates) {
          current.totaal = Math.round(current.aantal * current.prijsPerEenheid);
        }
        next[selectedItemIndex] = current;
        return next;
      });
    },
    [selectedItemIndex]
  );

  // Delete selected item
  const deleteItem = useCallback(() => {
    if (selectedItemIndex === null) return;
    setItems((prev) => prev.filter((_, i) => i !== selectedItemIndex));
    setSelectedItemIndex(null);
  }, [selectedItemIndex]);

  // Save factuur
  const handleSave = useCallback(async () => {
    if (!klantId) {
      toast({
        title: "Klant vereist",
        description: "Selecteer een klant voor de factuur.",
        variant: "destructive",
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: "Items vereist",
        description: "Voeg minimaal een item toe aan de factuur.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/facturen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          klantId,
          projectId: projectId || undefined,
          projectNaam,
          projectLocatie,
          datum,
          vervaldatum,
          status,
          notities,
          offerteId: offerteId || undefined,
          items: items.map((item) => ({
            omschrijving: item.omschrijving,
            aantal: item.aantal,
            eenheid: item.eenheid,
            prijsPerEenheid: item.prijsPerEenheid / 100,
            totaal: item.totaal / 100,
            btwTarief: item.btwTarief,
            notitie: item.notitie,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Opslaan mislukt");
      }

      const factuur = await res.json();
      toast({ title: "Factuur opgeslagen" });
      router.push(`/facturen/${factuur.id}`);
    } catch (err: any) {
      toast({
        title: "Fout",
        description: err.message || "Kon factuur niet opslaan.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [klantId, projectId, projectNaam, projectLocatie, datum, vervaldatum, status, notities, offerteId, items, toast, router]);

  // Save & send email
  const handleSaveAndSend = useCallback(async () => {
    if (!klantId) {
      toast({
        title: "Klant vereist",
        description: "Selecteer een klant.",
        variant: "destructive",
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: "Items vereist",
        description: "Voeg minimaal een item toe.",
        variant: "destructive",
      });
      return;
    }
    const klant = klanten.find((k) => k.id === klantId);
    if (!klant?.email) {
      toast({
        title: "Geen email",
        description: "Deze klant heeft geen emailadres.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // First save
      const res = await fetch("/api/facturen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          klantId,
          projectId: projectId || undefined,
          projectNaam,
          projectLocatie,
          datum,
          vervaldatum,
          status,
          notities,
          offerteId: offerteId || undefined,
          items: items.map((item) => ({
            omschrijving: item.omschrijving,
            aantal: item.aantal,
            eenheid: item.eenheid,
            prijsPerEenheid: item.prijsPerEenheid / 100,
            totaal: item.totaal / 100,
            btwTarief: item.btwTarief,
            notitie: item.notitie,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Opslaan mislukt");
      }

      const factuur = await res.json();

      // Then send email
      const emailRes = await fetch(`/api/facturen/${factuur.id}/email`, {
        method: "POST",
      });

      if (!emailRes.ok) {
        const err = await emailRes.json().catch(() => null);
        toast({
          title: "Factuur opgeslagen, email mislukt",
          description: err?.error || "Kon email niet versturen.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Factuur verstuurd",
          description: `Email verzonden naar ${klant.email}`,
        });
      }

      router.push(`/facturen/${factuur.id}`);
    } catch (err: any) {
      toast({
        title: "Fout",
        description: err.message || "Er ging iets mis.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }, [klantId, klanten, projectId, projectNaam, projectLocatie, datum, vervaldatum, status, notities, offerteId, items, toast, router]);

  return (
    <div className="fixed inset-0 md:left-64 top-0 md:top-0 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-10">
      {/* Collapsible Header */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/facturen"
              className="text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-white font-semibold text-lg">Nieuwe Factuur</h1>
          </div>

          {!headerExpanded && selectedKlant && (
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <span>{selectedKlant.naam}</span>
              {projectNaam && (
                <>
                  <span className="text-white/30">|</span>
                  <span>{projectNaam}</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || sending}
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Opslaan..." : "Opslaan"}
            </Button>
            <Button
              onClick={handleSaveAndSend}
              disabled={saving || sending}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Versturen..." : "Opslaan & Versturen"}
            </Button>
            <button
              onClick={() => setHeaderExpanded((v) => !v)}
              className="text-white/50 hover:text-white transition-colors p-1"
            >
              {headerExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {headerExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mt-4">
            <div className="flex flex-col gap-1">
              <label className="text-white/70 text-xs font-medium">
                Klant *
              </label>
              <Select value={klantId} onValueChange={setKlantId}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-amber-500/50">
                  <SelectValue placeholder="Selecteer klant" />
                </SelectTrigger>
                <SelectContent>
                  {klanten.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.naam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white/70 text-xs font-medium">
                Project
              </label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-amber-500/50">
                  <SelectValue placeholder="Optioneel" />
                </SelectTrigger>
                <SelectContent>
                  {projecten.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.naam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white/70 text-xs font-medium">
                Project naam
              </label>
              <Input
                value={projectNaam}
                onChange={(e) => setProjectNaam(e.target.value)}
                placeholder="Bijv. Badkamer renovatie"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-amber-500/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white/70 text-xs font-medium">
                Locatie
              </label>
              <Input
                value={projectLocatie}
                onChange={(e) => setProjectLocatie(e.target.value)}
                placeholder="Adres werklocatie"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-amber-500/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white/70 text-xs font-medium">
                Datum
              </label>
              <Input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="bg-white/10 border-white/20 text-white focus:ring-amber-500/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white/70 text-xs font-medium">
                Vervaldatum
              </label>
              <Input
                type="date"
                value={vervaldatum}
                onChange={(e) => setVervaldatum(e.target.value)}
                className="bg-white/10 border-white/20 text-white focus:ring-amber-500/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white/70 text-xs font-medium">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-amber-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOpties.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        <div className="w-1/4 overflow-hidden">
          <PrijslijstPanel
            prijslijst={prijslijst}
            onAddItem={addItemFromPrijslijst}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <FactuurPreviewPanel
            klant={selectedKlant}
            projectNaam={projectNaam}
            projectLocatie={projectLocatie}
            datum={datum}
            vervaldatum={vervaldatum}
            items={items}
            notities={notities}
            onSelectItem={setSelectedItemIndex}
            selectedItemIndex={selectedItemIndex}
          />
        </div>
        <div className="w-1/4 overflow-hidden">
          <ItemEditorPanel
            item={selectedItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        </div>
      </div>
    </div>
  );
}
