"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrijslijstItem {
  id: string;
  categorie: string;
  omschrijving: string;
  prijsPerEenheid: number;
  eenheid: string;
  materiaalKosten: number;
  actief: boolean;
}

interface PrijslijstPanelProps {
  prijslijst: PrijslijstItem[];
  onAddItem: (item: PrijslijstItem) => void;
}

const formatEuro = (cents: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(
    cents / 100
  );

export default function PrijslijstPanel({
  prijslijst,
  onAddItem,
}: PrijslijstPanelProps) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showCustom, setShowCustom] = useState(false);
  const [customOmschrijving, setCustomOmschrijving] = useState("");
  const [customPrijs, setCustomPrijs] = useState("");
  const [customEenheid, setCustomEenheid] = useState("stuks");

  const filtered = prijslijst.filter((item) => {
    if (!item.actief) return false;
    const q = search.toLowerCase();
    return (
      item.omschrijving.toLowerCase().includes(q) ||
      item.categorie.toLowerCase().includes(q)
    );
  });

  const grouped = filtered.reduce<Record<string, PrijslijstItem[]>>(
    (acc, item) => {
      const cat = item.categorie || "Overig";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {}
  );

  const categories = Object.keys(grouped).sort();

  const toggleCategory = (cat: string) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const handleAddCustom = () => {
    if (!customOmschrijving.trim()) return;
    const prijs = parseFloat(customPrijs.replace(",", ".")) || 0;
    onAddItem({
      id: "custom-" + Math.random().toString(36).substring(2, 11),
      categorie: "Aangepast",
      omschrijving: customOmschrijving.trim(),
      prijsPerEenheid: Math.round(prijs * 100),
      eenheid: customEenheid,
      materiaalKosten: 0,
      actief: true,
    });
    setCustomOmschrijving("");
    setCustomPrijs("");
    setCustomEenheid("stuks");
    setShowCustom(false);
  };

  return (
    <div className="flex flex-col h-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Prijslijst</h2>
          <button
            onClick={() => setShowCustom((v) => !v)}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            {showCustom ? "Annuleren" : "+ Aangepast item"}
          </button>
        </div>

        {showCustom && (
          <div className="mb-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
            <Input
              value={customOmschrijving}
              onChange={(e) => setCustomOmschrijving(e.target.value)}
              placeholder="Omschrijving"
              className="bg-white/10 border-white/20 placeholder:text-white/50 text-white text-sm"
            />
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="decimal"
                value={customPrijs}
                onChange={(e) => setCustomPrijs(e.target.value)}
                placeholder="Prijs (€)"
                className="bg-white/10 border-white/20 placeholder:text-white/50 text-white text-sm flex-1"
              />
              <Select value={customEenheid} onValueChange={setCustomEenheid}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stuks">stuks</SelectItem>
                  <SelectItem value="m²">m²</SelectItem>
                  <SelectItem value="uur">uur</SelectItem>
                  <SelectItem value="project">project</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                  <SelectItem value="m³">m³</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="dag">dag</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddCustom}
              disabled={!customOmschrijving.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Toevoegen aan offerte
            </Button>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam of categorie..."
            className="pl-9 bg-white/10 border-white/20 placeholder:text-white/50 text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {categories.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            Geen items gevonden
          </p>
        )}

        {categories.map((cat) => {
          const isCollapsed = collapsed[cat];
          return (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm text-white/90 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                )}
                <span>{cat}</span>
                <span className="ml-auto text-white/40 text-xs">
                  {grouped[cat].length}
                </span>
              </button>

              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {grouped[cat].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onAddItem(item)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/20 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">
                          {item.omschrijving}
                        </p>
                        <p className="text-white/50 text-xs">
                          {formatEuro(item.prijsPerEenheid)} / {item.eenheid}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-white/30 group-hover:text-white/70 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
