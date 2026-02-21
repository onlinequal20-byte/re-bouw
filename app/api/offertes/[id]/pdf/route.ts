import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice-pdf";
import React from "react";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    
    // Allow public access for signature pages if query param is present
    const url = new URL(request.url);
    const isPublic = url.searchParams.get("public") === "true";

    if (!session && !isPublic) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const offerte = await prisma.offerte.findUnique({
      where: { id: id },
      include: {
        klant: true,
        items: {
          orderBy: { volgorde: "asc" },
        },
      },
    });

    if (!offerte) {
      return NextResponse.json({ error: "Offerte niet gevonden" }, { status: 404 });
    }

    // Get company settings
    const settings = await prisma.settings.findMany();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Read logo file
    let logoBase64: string | undefined = undefined;
    try {
      const logoPath = path.join(process.cwd(), 'public/images/rebouw-logo.png');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      } else {
        console.warn("Logo file not found at:", logoPath);
      }
    } catch (error) {
      console.error("Error reading logo file:", error);
    }

    const pdfData = {
      type: 'offerte' as const,
      nummer: offerte.offerteNummer,
      datum: offerte.datum,
      geldigTot: offerte.geldigTot,
      klant: {
        naam: offerte.klant.naam,
        email: offerte.klant.email || undefined,
        telefoon: offerte.klant.telefoon || undefined,
        adres: offerte.klant.adres || undefined,
        postcode: offerte.klant.postcode || undefined,
        plaats: offerte.klant.plaats || undefined,
      },
      projectNaam: offerte.projectNaam,
      projectLocatie: offerte.projectLocatie || undefined,
      items: offerte.items.map(item => ({
        omschrijving: item.omschrijving,
        beschrijving: item.beschrijving || undefined,
        aantal: item.aantal,
        eenheid: item.eenheid,
        prijsPerEenheid: item.prijsPerEenheid,
        totaal: item.totaal,
      })),
      subtotaal: offerte.subtotaal,
      btwPercentage: offerte.btwPercentage,
      btwBedrag: offerte.btwBedrag,
      totaal: offerte.totaal,
      notities: offerte.notities || undefined,
      companyInfo: {
        naam: settingsMap['bedrijfsnaam'] || 'Re-Bouw B.V.',
        adres: settingsMap['adres'] || '',
        telefoon: settingsMap['telefoon'] || '0614601517',
        email: settingsMap['email'] || 'info@re-bouw.nl',
        website: settingsMap['website'] || 're-bouw.nl',
        kvk: settingsMap['kvk_nummer'] || '60443162',
        btw: settingsMap['btw_nummer'] || 'NL123456789B01',
        iban: settingsMap['iban'] || '',
      },
      betalingsvoorwaarden: settingsMap['betalingsvoorwaarden'],
      logoBase64,
    };

    const pdfBuffer = await renderToBuffer(React.createElement(InvoicePDF, { data: pdfData }) as any);

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${offerte.offerteNummer}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "PDF genereren mislukt" },
      { status: 500 }
    );
  }
}
