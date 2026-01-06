"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, FileText, Trash2, Check, X, Eye, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

interface Expense {
  id: string;
  datum: string;
  categorie: string;
  omschrijving: string;
  bedrag: number;
  btw: number;
  totaalBedrag: number;
  imageUrl: string;
  imageName: string;
  ocrBedrag: number | null;
  ocrWinkel: string | null;
  ocrVerified: boolean;
  status: string;
  uploadedVia: string;
  klant?: { id: string; naam: string };
  offerte?: { id: string; offerteNummer: string; projectNaam: string };
  factuur?: { id: string; factuurNummer: string; projectNaam: string };
}

interface Client {
  id: string;
  naam: string;
}

const CATEGORIES = [
  "Materialen",
  "Transport",
  "Gereedschap",
  "Onderaanneming",
  "Overig",
];

export default function KostenPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [totals, setTotals] = useState({ count: 0, totalBedrag: 0, totalBtw: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categorie, setCategorie] = useState("Materialen");
  const [omschrijving, setOmschrijving] = useState("");
  const [bedrag, setBedrag] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("none");

  useEffect(() => {
    fetchExpenses();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/klanten");
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses");
      const data = await response.json();
      setExpenses(data.expenses);
      setTotals(data.totals);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Kon kosten niet ophalen",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Geen bestand",
        description: "Selecteer eerst een bonnetje om te uploaden",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("categorie", categorie);
      formData.append("omschrijving", omschrijving);
      formData.append("bedrag", bedrag || "0");
      formData.append("uploadedVia", "web");
      
      if (selectedClientId && selectedClientId !== "none") {
        formData.append("klantId", selectedClientId);
      }

      const response = await fetch("/api/expenses/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast({
        title: "✅ Bonnetje geüpload!",
        description: `Bedrag: ${formatCurrency(data.expense.totaalBedrag)}`,
      });

      // Reset form
      setFile(null);
      setPreview(null);
      setOmschrijving("");
      setBedrag("");
      setSelectedClientId("none");
      fetchExpenses();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload mislukt",
        description: error.message || "Er is een fout opgetreden bij het uploaden",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze kostenpost wilt verwijderen?")) return;

    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      toast({
        title: "Verwijderd",
        description: "Kostenpost is verwijderd",
      });
      fetchExpenses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Kon kostenpost niet verwijderen",
      });
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ocrVerified: verified }),
      });

      if (!response.ok) throw new Error("Update failed");

      toast({
        title: verified ? "✅ Geverifieerd" : "❌ Verificatie verwijderd",
      });
      fetchExpenses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Kon status niet updaten",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Goedgekeurd</Badge>;
      case "rejected":
        return <Badge variant="destructive">Afgekeurd</Badge>;
      default:
        return <Badge variant="secondary">In behandeling</Badge>;
    }
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Kosten & Bonnetjes
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload en beheer je bonnetjes met automatische OCR
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-enhanced">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal Bonnetjes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.count}</div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal Bedrag (excl. BTW)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(totals.totalBedrag)}
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal BTW
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {formatCurrency(totals.totalBtw)}
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal (incl. BTW)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totals.totalAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Form */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Nieuw Bonnetje Uploaden
          </CardTitle>
          <CardDescription>
            Maak een foto of upload een scan van je bonnetje en vul het bedrag in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="file">Bonnetje Foto/Scan</Label>
              <Input
                id="file"
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {preview && (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
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
                <Label htmlFor="client">Klant (Optioneel)</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een klant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Geen klant koppelen</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.naam}
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrag">Bedrag (excl. BTW)</Label>
                <Input
                  id="bedrag"
                  type="number"
                  step="0.01"
                  value={bedrag}
                  onChange={(e) => setBedrag(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || !omschrijving || !bedrag || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  "Uploaden en verwerken..."
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Bonnetje
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Alle Bonnetjes</CardTitle>
          <CardDescription>
            Overzicht van alle geüploade bonnetjes en kosten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Omschrijving</TableHead>
                <TableHead className="text-right">Bedrag</TableHead>
                <TableHead className="text-right">BTW</TableHead>
                <TableHead className="text-right">Totaal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(new Date(expense.datum))}</TableCell>
                  <TableCell>
                    {expense.klant ? (
                      <Link href={`/klanten/${expense.klant.id}`} className="hover:underline text-blue-600 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {expense.klant.naam}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.categorie}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{expense.omschrijving}</span>
                      {expense.ocrWinkel && expense.ocrWinkel !== expense.omschrijving && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {expense.ocrWinkel}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(expense.bedrag)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(expense.btw)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(expense.totaalBedrag)}
                  </TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedImage(expense.imageUrl)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!expense.ocrVerified && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerify(expense.id, true)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Geen bonnetjes gevonden. Upload er een hierboven!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Bonnetje Voorbeeld</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full h-full min-h-[400px]">
              <Image
                src={selectedImage}
                alt="Receipt"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
