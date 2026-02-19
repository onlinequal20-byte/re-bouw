import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice-pdf";
import { sendEmail, generateOfferteEmail } from "@/lib/email/email-service";
import React from "react";
import fs from "fs";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    
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

    if (!offerte.klant.email) {
      return NextResponse.json(
        { error: "Klant heeft geen emailadres" },
        { status: 400 }
      );
    }

    // Get company settings
    const settings = await prisma.settings.findMany();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Generate PDF
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

    const pdfBuffer = await renderToBuffer(React.createElement(InvoicePDF, { data: pdfData }) as any);

    // Read Algemene Voorwaarden
    const avPath = path.join(process.cwd(), 'public', 'algemene-voorwaarden.txt');
    const avContent = fs.readFileSync(avPath);

    // Get base URL for signature link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dashboard.amsbouwers.nl';

    // Generate email content
    const { subject, body } = generateOfferteEmail(offerte, baseUrl);

    // Send email
    await sendEmail({
      to: offerte.klant.email,
      subject,
      body,
      attachments: [
        {
          filename: `${offerte.offerteNummer}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
        {
          filename: 'Algemene-Voorwaarden-AMS-Bouwers.txt',
          content: avContent,
          contentType: 'text/plain',
        },
      ],
    });

    // Update offerte as sent
    await prisma.offerte.update({
      where: { id: offerte.id },
      data: {
        emailVerzonden: true,
        status: offerte.status === 'Concept' ? 'Verzonden' : offerte.status,
      },
    });

    // Log email
    await prisma.email.create({
      data: {
        type: 'offerte',
        documentId: offerte.id,
        documentNummer: offerte.offerteNummer,
        recipient: offerte.klant.email,
        recipientName: offerte.klant.naam,
        subject,
        body,
        status: 'verzonden',
      },
    });

    return NextResponse.json({ success: true, message: "Email verzonden" });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

