"use client";

import { Trash2, Edit3, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemEditorPanelProps {
  item: {
    id: string;
    omschrijving: string;
    aantal: number;
    eenheid: string;
    prijsPerEenheid: number;
    totaal: number;
    btwTarief: string;
    notitie?: string;
  } | null;
  onUpdate: (
    updates: Partial<{
      omschrijving: string;
      aantal: number;
      eenheid: string;
      prijsPerEenheid: number;
      btwTarief: string;
      notitie: string;
    }>
  ) => void;
  onDelete: () => void;
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(
    cents / 100
  );

const eenheidOpties = [
  { value: "stuks", label: "stuks" },
  { value: "m²", label: "m²" },
  { value: "uur", label: "uur" },
  { value: "project", label: "project" },
  { value: "m", label: "m" },
  { value: "m³", label: "m³" },
  { value: "kg", label: "kg" },
  { value: "dag", label: "dag" },
];

const btwOpties = [
  { value: "HOOG_21", label: "21%" },
  { value: "LAAG_9", label: "9%" },
  { value: "VERLEGD", label: "Verlegd" },
  { value: "VRIJGESTELD", label: "Vrijgesteld" },
];

export default function ItemEditorPanel({
  item,
  onUpdate,
  onDelete,
}: ItemEditorPanelProps) {
  if (!item) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center h-full gap-3">
        <Edit3 className="w-10 h-10 text-white/30" />
        <p className="text-white/50 text-sm">
          Selecteer een item om te bewerken
        </p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 h-full overflow-y-auto">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-amber-400" />
        <h2 className="text-white font-semibold text-lg">Item bewerken</h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-white/70 text-sm font-medium">
          Omschrijving
        </label>
        <Textarea
          rows={3}
          value={item.omschrijving}
          onChange={(e) => onUpdate({ omschrijving: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-amber-500/50"
          placeholder="Omschrijving van het item"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-white/70 text-sm font-medium">Aantal</label>
        <Input
          type="text"
          inputMode="decimal"
          defaultValue={item.aantal}
          key={item.id + "-aantal"}
          onBlur={(e) => {
            const val = parseFloat(e.target.value.replace(",", ".")) || 0;
            onUpdate({ aantal: val });
            e.target.value = String(val);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          placeholder="1"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-white/70 text-sm font-medium">Eenheid</label>
        <Select
          value={item.eenheid}
          onValueChange={(value) => onUpdate({ eenheid: value })}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-amber-500/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eenheidOpties.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-white/70 text-sm font-medium">
          Prijs per eenheid
        </label>
        <Input
          type="text"
          inputMode="decimal"
          defaultValue={(item.prijsPerEenheid / 100).toFixed(2)}
          key={item.id + "-prijs"}
          onBlur={(e) => {
            const val = parseFloat(e.target.value.replace(",", ".")) || 0;
            onUpdate({ prijsPerEenheid: Math.round(val * 100) });
            e.target.value = (Math.round(val * 100) / 100).toFixed(2);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="0.00"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-white/70 text-sm font-medium">BTW Tarief</label>
        <Select
          value={item.btwTarief}
          onValueChange={(value) => onUpdate({ btwTarief: value })}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-amber-500/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {btwOpties.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-white/70 text-sm font-medium">
          Extra notitie
        </label>
        <Textarea
          rows={2}
          value={item.notitie ?? ""}
          onChange={(e) => onUpdate({ notitie: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-amber-500/50"
          placeholder="Eventuele extra toelichting"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-white/70 text-sm font-medium">Totaal</label>
        <div className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white font-medium">
          {formatCurrency(item.aantal * item.prijsPerEenheid)}
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button
          variant="outline"
          onClick={onDelete}
          className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Verwijderen
        </Button>
      </div>
    </div>
  );
}
