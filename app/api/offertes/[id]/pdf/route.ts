import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice-pdf";
import React from "react";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Offerte not found" }, { status: 404 });
    }

    // Get company settings
    const settings = await prisma.settings.findMany();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

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
        naam: settingsMap['bedrijfsnaam'] || 'AMS Bouwers B.V.',
        adres: settingsMap['adres'] || 'Sloterweg 1160, 1066 CV Amsterdam',
        telefoon: settingsMap['telefoon'] || '0642959565',
        email: settingsMap['email'] || 'info@amsbouwers.nl',
        website: settingsMap['website'] || 'amsbouwers.nl',
        kvk: settingsMap['kvk_nummer'] || '80195466',
        btw: settingsMap['btw_nummer'] || 'NL123456789B01',
        iban: settingsMap['iban'] || 'NL91ABNA0417164300',
      },
      betalingsvoorwaarden: settingsMap['betalingsvoorwaarden'],
    };

    const pdfBuffer = await renderToBuffer(React.createElement(InvoicePDF, { data: pdfData }));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${offerte.offerteNummer}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

