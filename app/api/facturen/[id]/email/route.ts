import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice-pdf";
import { sendEmail, generateFactuurEmail } from "@/lib/email/email-service";
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
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const factuur = await prisma.factuur.findUnique({
      where: { id: id },
      include: {
        klant: true,
        items: {
          orderBy: { volgorde: "asc" },
        },
      },
    });

    if (!factuur) {
      return NextResponse.json({ error: "Factuur niet gevonden" }, { status: 404 });
    }

    if (!factuur.klant.email) {
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
      type: 'factuur' as const,
      nummer: factuur.factuurNummer,
      datum: factuur.datum,
      vervaldatum: factuur.vervaldatum,
      klant: {
        naam: factuur.klant.naam,
        email: factuur.klant.email || undefined,
        telefoon: factuur.klant.telefoon || undefined,
        adres: factuur.klant.adres || undefined,
        postcode: factuur.klant.postcode || undefined,
        plaats: factuur.klant.plaats || undefined,
      },
      projectNaam: factuur.projectNaam,
      projectLocatie: factuur.projectLocatie || undefined,
      items: factuur.items.map(item => ({
        omschrijving: item.omschrijving,
        aantal: item.aantal,
        eenheid: item.eenheid,
        prijsPerEenheid: item.prijsPerEenheid,
        totaal: item.totaal,
      })),
      subtotaal: factuur.subtotaal,
      btwPercentage: factuur.btwPercentage,
      btwBedrag: factuur.btwBedrag,
      totaal: factuur.totaal,
      notities: factuur.notities || undefined,
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
    };

    const pdfBuffer = await renderToBuffer(React.createElement(InvoicePDF, { data: pdfData }) as any);

    // Read Algemene Voorwaarden
    const avPath = path.join(process.cwd(), 'public', 'algemene-voorwaarden.txt');
    const avContent = fs.readFileSync(avPath);

    // Get base URL for signature link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dashboard.re-bouw.nl';

    // Generate email content
    const { subject, body } = generateFactuurEmail(factuur, baseUrl);

    // Send email
    await sendEmail({
      to: factuur.klant.email,
      subject,
      body,
      attachments: [
        {
          filename: `${factuur.factuurNummer}.pdf`,
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

    // Update factuur as sent, and set status to Verzonden if currently Concept
    await prisma.factuur.update({
      where: { id: factuur.id },
      data: {
        emailVerzonden: true,
        ...(factuur.status === 'Concept' ? { status: 'Verzonden' } : {}),
      },
    });

    // Log email
    await prisma.email.create({
      data: {
        type: 'factuur',
        documentId: factuur.id,
        documentNummer: factuur.factuurNummer,
        recipient: factuur.klant.email,
        recipientName: factuur.klant.naam,
        subject,
        body,
        status: 'verzonden',
      },
    });

    return NextResponse.json({ success: true, message: "Email verzonden" });
  } catch (error: unknown) {
    return handleApiError(error, "factuur email verzenden");
  }
}

