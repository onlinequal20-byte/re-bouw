"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SignaturePad } from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, FileText } from "lucide-react";

export default function SignaturePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [signature, setSignature] = useState("");
  const [naam, setNaam] = useState("");
  const [acceptedAV, setAcceptedAV] = useState(false);

  const type = params.type as string; // 'offerte' or 'factuur'
  const id = params.id as string;

  useEffect(() => {
    loadDocument();
  }, []);

  const loadDocument = async () => {
    try {
      const endpoint = type === "offerte" ? "offertes" : "facturen";
      const res = await fetch(`/api/${endpoint}/${id}?public=true`);
      
      if (!res.ok) {
        throw new Error("Document niet gevonden");
      }

      const data = await res.json();

      // Check if already signed
      if (data.klantHandtekening) {
        setSigned(true);
      }

      // Track "Bekeken" for offertes that haven't been signed or viewed yet
      if (type === "offerte" && !data.klantHandtekening && !data.bekeken) {
        fetch(`/api/offertes/${id}/bekeken`, { method: "POST" }).catch(() => {});
      }

      setDocument(data);
    } catch (error) {
      toast({
        title: "Fout",
        description: "Document kon niet worden geladen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signature) {
      toast({
        title: "Handtekening vereist",
        description: "Plaats eerst uw handtekening",
        variant: "destructive",
      });
      return;
    }

    if (!naam.trim()) {
      toast({
        title: "Naam vereist",
        description: "Vul uw naam in",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedAV) {
      toast({
        title: "Algemene voorwaarden",
        description: "U moet akkoord gaan met de algemene voorwaarden",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = type === "offerte" ? "offertes" : "facturen";
      const res = await fetch(`/api/${endpoint}/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature,
          naam,
        }),
      });

      if (!res.ok) {
        throw new Error("Ondertekening mislukt");
      }

      toast({
        title: "Succesvol ondertekend! ✅",
        description: `${type === "offerte" ? "Offerte" : "Factuur"} is succesvol ondertekend`,
      });

      setDocument((prev: any) => ({
        ...prev,
        klantNaam: naam,
        klantGetekendOp: new Date().toISOString(),
      }));
      setSigned(true);
    } catch (error) {
      toast({
        title: "Fout",
        description: "Ondertekening mislukt. Probeer opnieuw.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Document Ondertekend</CardTitle>
            <CardDescription>
              Dit document is al ondertekend op{" "}
              {document?.klantGetekendOp
                ? new Date(document.klantGetekendOp).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "onbekende datum"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Ondertekend door:</strong> {document?.klantNaam}
              </p>
              <p>
                <strong>Document:</strong>{" "}
                {type === "offerte" ? document?.offerteNummer : document?.factuurNummer}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Re-Bouw B.V.
          </h1>
          <p className="text-gray-600">
            {type === "offerte" ? "Offerte" : "Factuur"} Ondertekenen
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Documentnummer</p>
                <p className="font-semibold">
                  {type === "offerte" ? document?.offerteNummer : document?.factuurNummer}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Datum</p>
                <p className="font-semibold">
                  {new Date(document?.datum).toLocaleDateString("nl-NL")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Project</p>
                <p className="font-semibold">{document?.projectNaam}</p>
              </div>
              <div>
                <p className="text-gray-600">Totaalbedrag</p>
                <p className="font-semibold text-lg">
                  € {document?.totaal ? (document.totaal / 100).toFixed(2).replace('.', ',') : '0,00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uw Gegevens</CardTitle>
              <CardDescription>
                Vul uw naam in zoals deze op het document moet verschijnen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="naam">Volledige Naam *</Label>
                <Input
                  id="naam"
                  value={naam}
                  onChange={(e) => setNaam(e.target.value)}
                  placeholder="bijv. Jan Jansen"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Handtekening *</CardTitle>
              <CardDescription>
                Teken hieronder met uw muis of vinger (op touchscreen)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignaturePad
                onSave={setSignature}
                onClear={() => setSignature("")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Algemene Voorwaarden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="av"
                  checked={acceptedAV}
                  onCheckedChange={(checked) => setAcceptedAV(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="av"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Ik ga akkoord met de algemene voorwaarden *
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Door te ondertekenen gaat u akkoord met onze{" "}
                    <a
                      href="/algemene-voorwaarden.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      algemene voorwaarden
                      <FileText className="h-3 w-3" />
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              disabled={submitting || !signature || !naam || !acceptedAV}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bezig met ondertekenen...
                </>
              ) : (
                "Document Ondertekenen"
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            * Verplichte velden
          </p>
        </form>
      </div>
    </div>
  );
}

