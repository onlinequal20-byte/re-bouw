"use client";

import { FileText } from "lucide-react";

const BTW_RATES: Record<string, number> = {
  HOOG_21: 21,
  LAAG_9: 9,
  VERLEGD: 0,
  VRIJGESTELD: 0,
};

interface PreviewPanelProps {
  klant: {
    naam: string;
    adres?: string;
    postcode?: string;
    plaats?: string;
    email?: string;
  } | null;
  projectNaam: string;
  projectLocatie: string;
  datum: string;
  geldigTot: string;
  items: Array<{
    id: string;
    omschrijving: string;
    aantal: number;
    eenheid: string;
    prijsPerEenheid: number;
    totaal: number;
    btwTarief: string;
    notitie?: string;
  }>;
  notities: string;
  onSelectItem: (index: number) => void;
  selectedItemIndex: number | null;
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getBtwLabel(tarief: string): string {
  const rate = BTW_RATES[tarief];
  if (tarief === "VERLEGD") return "Verlegd";
  if (tarief === "VRIJGESTELD") return "Vrijgesteld";
  return rate !== undefined ? `${rate}%` : tarief;
}

export default function PreviewPanel({
  klant,
  projectNaam,
  projectLocatie,
  datum,
  geldigTot,
  items,
  notities,
  onSelectItem,
  selectedItemIndex,
}: PreviewPanelProps) {
  // Calculate totals
  const subtotaal = items.reduce((sum, item) => sum + item.totaal, 0);

  const btwBreakdown: Record<string, { label: string; bedrag: number }> = {};
  for (const item of items) {
    const rate = BTW_RATES[item.btwTarief] ?? 0;
    if (rate === 0) continue;
    const key = item.btwTarief;
    if (!btwBreakdown[key]) {
      btwBreakdown[key] = { label: `BTW ${rate}%`, bedrag: 0 };
    }
    btwBreakdown[key].bedrag += Math.round(item.totaal * (rate / 100));
  }

  const totaalBtw = Object.values(btwBreakdown).reduce(
    (sum, b) => sum + b.bedrag,
    0
  );
  const totaal = subtotaal + totaalBtw;

  return (
    <div className="flex h-full flex-col backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-full text-gray-900">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                OFFERTE
              </h1>
              <span className="text-sm font-medium text-gray-500">
                Re-Bouw
              </span>
            </div>
            <div className="h-1 bg-amber-500 rounded-full" />
          </div>

          {/* Client & Project Info */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
                Klant
              </p>
              {klant ? (
                <>
                  <p className="font-medium">{klant.naam}</p>
                  {klant.adres && <p className="text-gray-600">{klant.adres}</p>}
                  {(klant.postcode || klant.plaats) && (
                    <p className="text-gray-600">
                      {[klant.postcode, klant.plaats].filter(Boolean).join(" ")}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-400 italic">Geen klant geselecteerd</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
                Project
              </p>
              <p className="font-medium">
                {projectNaam || (
                  <span className="text-gray-400 italic">Geen projectnaam</span>
                )}
              </p>
              {projectLocatie && (
                <p className="text-gray-600">{projectLocatie}</p>
              )}
              <div className="mt-2 flex gap-4 text-xs text-gray-500">
                <span>Datum: {formatDate(datum) || "—"}</span>
                <span>Geldig tot: {formatDate(geldigTot) || "—"}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">
                Voeg items toe via de prijslijst
              </p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left text-xs font-semibold uppercase text-gray-400">
                    <th className="py-2 pr-2 w-8">#</th>
                    <th className="py-2 pr-2">Omschrijving</th>
                    <th className="py-2 pr-2 text-right w-16">Aantal</th>
                    <th className="py-2 pr-2 w-16">Eenheid</th>
                    <th className="py-2 pr-2 text-right w-20">Prijs</th>
                    <th className="py-2 pr-2 text-right w-16">BTW</th>
                    <th className="py-2 text-right w-24">Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.id}
                      onClick={() => onSelectItem(idx)}
                      className={`border-b border-gray-100 cursor-pointer transition-all ${
                        selectedItemIndex === idx
                          ? "ring-2 ring-amber-500 bg-amber-500/10 rounded"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="py-2 pr-2 text-gray-400">{idx + 1}</td>
                      <td className="py-2 pr-2">
                        <span>{item.omschrijving}</span>
                        {item.notitie && (
                          <p className="text-xs italic text-gray-400 mt-0.5">
                            {item.notitie}
                          </p>
                        )}
                      </td>
                      <td className="py-2 pr-2 text-right">{item.aantal}</td>
                      <td className="py-2 pr-2 text-gray-500">{item.eenheid}</td>
                      <td className="py-2 pr-2 text-right">
                        {formatMoney(item.prijsPerEenheid)}
                      </td>
                      <td className="py-2 pr-2 text-right text-gray-500">
                        {getBtwLabel(item.btwTarief)}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatMoney(item.totaal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotaal</span>
                    <span>{formatMoney(subtotaal)}</span>
                  </div>
                  {Object.entries(btwBreakdown).map(([key, { label, bedrag }]) => (
                    <div key={key} className="flex justify-between text-gray-500">
                      <span>{label}</span>
                      <span>{formatMoney(bedrag)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-1">
                    <span>Totaal</span>
                    <span>{formatMoney(totaal)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notities */}
          {notities && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
                Opmerkingen
              </p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {notities}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
