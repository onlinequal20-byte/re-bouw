"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Upload, Receipt, Image as ImageIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const eurosToCents = (euros: number) => Math.round(euros * 100);

const CATEGORIES = [
  "Materialen",
  "Transport",
  "Gereedschap",
  "Voertuig",
  "Abonnementen",
  "Onderaanneming",
  "Overig",
];

const DUTCH_MONTHS = [
  "Januari",
  "Februari",
  "Maart",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Augustus",
  "September",
  "Oktober",
  "November",
  "December",
];

interface Expense {
  id: string;
  datum: string;
  categorie: string;
  omschrijving: string;
  bedrag: number;
  btw: number;
  totaalBedrag: number;
  imageUrl: string | null;
  notities: string | null;
  project?: { id: string; projectNummer: string; naam: string } | null;
}

interface Project {
  id: string;
  projectNummer: string;
  naam: string;
}

function todayString() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function KostenPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [datum, setDatum] = useState(todayString());
  const [categorie, setCategorie] = useState("Materialen");
  const [omschrijving, setOmschrijving] = useState("");
  const [bedrag, setBedrag] = useState("");
  const [btwField, setBtwField] = useState("");
  const [projectId, setProjectId] = useState("none");
  const [notities, setNotities] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Filters
  const [filterCategorie, setFilterCategorie] = useState("alle");
  const [filterMonth, setFilterMonth] = useState("alle");
  const [filterSearch, setFilterSearch] = useState("");

  // Auto-calculate BTW when bedrag changes
  useEffect(() => {
    const val = parseFloat(bedrag);
    if (!isNaN(val) && val > 0) {
      setBtwField((val * 0.21).toFixed(2));
    } else {
      setBtwField("");
    }
  }, [bedrag]);

  const totaalInclBtw = (() => {
    const b = parseFloat(bedrag) || 0;
    const v = parseFloat(btwField) || 0;
    return (b + v).toFixed(2);
  })();

  useEffect(() => {
    fetchExpenses();
    fetchProjects();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses");
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projecten");
      const data = await response.json();
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const resetForm = () => {
    setDatum(todayString());
    setCategorie("Materialen");
    setOmschrijving("");
    setBedrag("");
    setBtwField("");
    setProjectId("none");
    setNotities("");
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!omschrijving || !bedrag) return;
    setSubmitting(true);

    try {
      let imageUrl: string | null = null;

      // Upload file first if selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("categorie", categorie);
        formData.append("omschrijving", omschrijving);
        formData.append("bedrag", bedrag);
        formData.append("uploadedVia", "web");

        const uploadRes = await fetch("/api/expenses/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Upload mislukt");
        }

        // Upload endpoint already creates the expense, so just refresh and return
        await fetchExpenses();
        resetForm();
        setSubmitting(false);
        return;
      }

      // No file - create expense via JSON POST
      const bedragCents = eurosToCents(parseFloat(bedrag) || 0);
      const btwCents = eurosToCents(parseFloat(btwField) || 0);
      const totaalCents = bedragCents + btwCents;

      const body: Record<string, unknown> = {
        datum,
        categorie,
        omschrijving,
        bedrag: bedragCents,
        btw: btwCents,
        totaalBedrag: totaalCents,
        notities: notities || undefined,
      };

      if (projectId && projectId !== "none") {
        body.projectId = projectId;
      }

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Aanmaken mislukt");
      }

      await fetchExpenses();
      resetForm();
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(error.message || "Er is een fout opgetreden");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze kostenpost wilt verwijderen?")) return;

    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Verwijderen mislukt");
      await fetchExpenses();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Kon kostenpost niet verwijderen");
    }
  };

  // Summary calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.datum);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const thisYearExpenses = expenses.filter((e) => {
    const d = new Date(e.datum);
    return d.getFullYear() === currentYear;
  });

  const totaalDezeMaand = thisMonthExpenses.reduce((s, e) => s + e.totaalBedrag, 0);
  const totaalDitJaar = thisYearExpenses.reduce((s, e) => s + e.totaalBedrag, 0);
  const aantalKosten = expenses.length;
  const btwDezeMaand = thisMonthExpenses.reduce((s, e) => s + e.btw, 0);

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    if (filterCategorie !== "alle" && e.categorie !== filterCategorie) return false;
    if (filterMonth !== "alle") {
      const d = new Date(e.datum);
      if (d.getMonth() !== parseInt(filterMonth)) return false;
    }
    if (filterSearch && !e.omschrijving.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kosten</h1>
        <p className="text-muted-foreground mt-1">Beheer al uw bedrijfskosten</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal deze maand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totaalDezeMaand)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal dit jaar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totaalDitJaar)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aantal kosten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aantalKosten}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              BTW deze maand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(btwDezeMaand)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick-add form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nieuwe Uitgave Toevoegen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Datum, Categorie, Omschrijving */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="datum">Datum</Label>
              <Input
                id="datum"
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categorie">Categorie</Label>
              <Select value={categorie} onValueChange={setCategorie}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="omschrijving">Omschrijving</Label>
              <Input
                id="omschrijving"
                value={omschrijving}
                onChange={(e) => setOmschrijving(e.target.value)}
                placeholder="Bijv. Bouwmaterialen Praxis"
              />
            </div>
          </div>

          {/* Row 2: Bedrag, BTW, Totaal */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bedrag">Bedrag ex BTW</Label>
              <Input
                id="bedrag"
                type="number"
                step="0.01"
                min="0"
                value={bedrag}
                onChange={(e) => setBedrag(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="btw">BTW</Label>
              <Input
                id="btw"
                type="number"
                step="0.01"
                min="0"
                value={btwField}
                onChange={(e) => setBtwField(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totaal">Totaal incl BTW</Label>
              <Input
                id="totaal"
                type="text"
                value={totaalInclBtw}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Row 3: Project, Notities */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project">Project (optioneel)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geen project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.projectNummer} - {p.naam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notities">Notities (optioneel)</Label>
              <Input
                id="notities"
                value={notities}
                onChange={(e) => setNotities(e.target.value)}
                placeholder="Extra notities..."
              />
            </div>
          </div>

          {/* Row 4: File upload + Submit */}
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="file">Bonnetje uploaden (optioneel)</Label>
              <Input
                id="file"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!omschrijving || !bedrag || submitting}
              size="lg"
            >
              {submitting ? (
                "Bezig..."
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Toevoegen
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <Select value={filterCategorie} onValueChange={setFilterCategorie}>
            <SelectTrigger>
              <SelectValue placeholder="Categorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle categorieën</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Maand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle maanden</SelectItem>
              {DUTCH_MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Zoek op omschrijving..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Expenses table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Omschrijving</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead className="text-right">Bedrag</TableHead>
                <TableHead className="text-right">BTW</TableHead>
                <TableHead className="text-right">Totaal</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Bonnetje</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Geen kosten gevonden
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(new Date(expense.datum))}</TableCell>
                    <TableCell>{expense.omschrijving}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.categorie}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(expense.bedrag)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(expense.btw)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(expense.totaalBedrag)}
                    </TableCell>
                    <TableCell>
                      {expense.project ? (
                        <span className="text-sm">
                          {expense.project.naam}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.imageUrl ? (
                        <a
                          href={expense.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          <Receipt className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
