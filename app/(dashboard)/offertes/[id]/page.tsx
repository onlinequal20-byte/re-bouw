import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Download, CheckCircle2, Copy, ExternalLink, FileText, ArrowRight, Mail, Clock, CircleDot } from "lucide-react";
import Link from "next/link";
import { EmailButton } from "@/components/email-button";
import { FacturerenButton } from "./factureren-button";
import { ReminderButton } from "./reminder-button";
import Image from "next/image";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "Getekend":
      return "success" as const;
    case "Verzonden":
      return "default" as const;
    case "Bekeken":
      return "outline" as const;
    case "Concept":
      return "secondary" as const;
    case "Verlopen":
    case "Afgewezen":
      return "destructive" as const;
    default:
      return "default" as const;
  }
}

export default async function OfferteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offerte = await prisma.offerte.findUnique({
    where: { id },
    include: {
      klant: true,
      items: {
        orderBy: { volgorde: "asc" },
      },
      facturen: { select: { id: true, factuurNummer: true } },
    },
  });

  if (!offerte) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/offertes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {offerte.offerteNummer}
            </h1>
            <p className="text-muted-foreground">Offerte details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/api/offertes/${offerte.id}/pdf`} target="_blank">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </a>
          <EmailButton
            id={offerte.id}
            type="offerte"
            clientEmail={offerte.klant.email}
          />
          {!offerte.klantHandtekening && offerte.emailVerzonden && (
            <ReminderButton offerteId={offerte.id} />
          )}
          {offerte.klantHandtekening && offerte.facturen.length === 0 && (
            <FacturerenButton offerteId={offerte.id} />
          )}
          {offerte.klantHandtekening && offerte.facturen.length > 0 && (
            <Link href={`/facturen/${offerte.facturen[0].id}`}>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Bekijk Factuur
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Klantgegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Naam:</span>
              <p className="font-medium">{offerte.klant.naam}</p>
            </div>
            {offerte.klant.email && (
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{offerte.klant.email}</p>
              </div>
            )}
            {offerte.klant.telefoon && (
              <div>
                <span className="text-sm text-muted-foreground">Telefoon:</span>
                <p className="font-medium">{offerte.klant.telefoon}</p>
              </div>
            )}
            {offerte.klant.adres && (
              <div>
                <span className="text-sm text-muted-foreground">Adres:</span>
                <p className="font-medium">{offerte.klant.adres}</p>
                {offerte.klant.postcode && offerte.klant.plaats && (
                  <p className="font-medium">
                    {offerte.klant.postcode} {offerte.klant.plaats}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offerte Gegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Status:</span>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(offerte.status)}>
                  {offerte.status}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Datum:</span>
              <p className="font-medium">{formatDate(offerte.datum)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Geldig tot:</span>
              <p className="font-medium">{formatDate(offerte.geldigTot)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Project:</span>
              <p className="font-medium">{offerte.projectNaam}</p>
              {offerte.projectLocatie && (
                <p className="text-sm text-muted-foreground">
                  {offerte.projectLocatie}
                </p>
              )}
              {(offerte as any).project && (
                <Link href={`/projecten/${(offerte as any).project.id}`} className="text-blue-600 hover:underline text-sm">
                  {(offerte as any).project.projectNummer}
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Omschrijving</TableHead>
                <TableHead className="text-right">Aantal</TableHead>
                <TableHead>Eenheid</TableHead>
                <TableHead className="text-right">Prijs/Eenheid</TableHead>
                <TableHead className="text-right">Totaal</TableHead>
                <TableHead>BTW</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offerte.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.omschrijving}</TableCell>
                  <TableCell className="text-right">{item.aantal}</TableCell>
                  <TableCell>{item.eenheid}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.prijsPerEenheid)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.totaal)}
                  </TableCell>
                  <TableCell>
                    {(item as any).btwTarief === "LAAG_9" ? "9%" : (item as any).btwTarief === "VERLEGD" ? "Verlegd" : (item as any).btwTarief === "VRIJGESTELD" ? "Vrijgesteld" : "21%"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotaal:</span>
              <span className="font-medium">
                {formatCurrency(offerte.subtotaal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BTW:</span>
              <span className="font-medium">
                {formatCurrency(offerte.btwBedrag)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Totaal:</span>
              <span>{formatCurrency(offerte.totaal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {offerte.notities && (
        <Card>
          <CardHeader>
            <CardTitle>Notities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{offerte.notities}</p>
          </CardContent>
        </Card>
      )}

      {/* Status Timeline & Next Steps */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardContent className="pt-6">
          {/* Timeline */}
          <div className="flex items-center justify-between mb-6">
            {[
              { label: "Concept", done: true },
              { label: "Verzonden", done: offerte.emailVerzonden },
              { label: "Getekend", done: !!offerte.klantHandtekening },
              { label: "Gefactureerd", done: offerte.facturen.length > 0 },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done
                      ? "bg-green-100 text-green-700 border-2 border-green-500"
                      : "bg-muted text-muted-foreground border-2 border-muted-foreground/20"
                  }`}>
                    {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 ${step.done ? "text-green-700 font-medium" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 ${step.done ? "bg-green-500" : "bg-muted-foreground/20"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Next Step Guidance */}
          {!offerte.emailVerzonden && !offerte.klantHandtekening && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Mail className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Volgende stap: Verstuur de offerte</p>
                <p className="text-xs text-blue-700">Klik op &quot;Verstuur Email&quot; om de offerte naar de klant te sturen</p>
              </div>
            </div>
          )}
          {offerte.emailVerzonden && !offerte.klantHandtekening && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Clock className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">Wachten op handtekening</p>
                <p className="text-xs text-amber-700">De offerte is verstuurd. Stuur eventueel een herinnering als de klant niet reageert</p>
              </div>
            </div>
          )}
          {offerte.klantHandtekening && offerte.facturen.length === 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <ArrowRight className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">Klaar voor facturatie!</p>
                <p className="text-xs text-green-700">De offerte is getekend. Klik op &quot;Maak Factuur&quot; om een factuur te genereren</p>
              </div>
            </div>
          )}
          {offerte.facturen.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">Factuur aangemaakt</p>
                <p className="text-xs text-green-700">
                  Factuur {offerte.facturen[0].factuurNummer} is aangemaakt vanuit deze offerte
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signature Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {offerte.klantHandtekening ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Digitaal Ondertekend
              </>
            ) : (
              "Ondertekening Status"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {offerte.klantHandtekening ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm text-muted-foreground">Ondertekend door:</span>
                  <p className="font-medium">{offerte.klantNaam}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Datum:</span>
                  <p className="font-medium">
                    {offerte.klantGetekendOp
                      ? new Date(offerte.klantGetekendOp).toLocaleString("nl-NL")
                      : "-"}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block mb-2">
                  Handtekening:
                </span>
                <div className="border rounded-lg p-4 bg-white inline-block">
                  <Image
                    src={offerte.klantHandtekening}
                    alt="Handtekening"
                    width={300}
                    height={100}
                    className="max-w-full h-auto"
                  />
                </div>
              </div>
              {offerte.algemeneVoorwaardenUrl && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Akkoord met algemene voorwaarden
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Deze offerte is nog niet ondertekend door de klant.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/ondertekenen/offerte/${offerte.id}`}
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                  />
                </div>
                <a
                  href={`/ondertekenen/offerte/${offerte.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button size="sm" variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Onderteken Pagina Openen
                  </Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

