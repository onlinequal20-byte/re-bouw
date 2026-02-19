import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { generateFactuurNummer } from "@/lib/number-generator";
import { handleApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const offerte = await prisma.offerte.findUnique({
      where: { id },
      include: {
        klant: true,
        items: { orderBy: { volgorde: "asc" } },
        facturen: true,
      },
    });

    if (!offerte) {
      return NextResponse.json({ error: "Offerte niet gevonden" }, { status: 404 });
    }

    // Must be signed (Getekend or Geaccepteerd for backwards compat)
    if (offerte.status !== "Getekend" && offerte.status !== "Geaccepteerd") {
      return NextResponse.json(
        { error: "Offerte moet eerst getekend zijn" },
        { status: 400 }
      );
    }

    // Check if invoice already exists for this offerte
    if (offerte.facturen.length > 0) {
      return NextResponse.json(
        { error: "Er is al een factuur aangemaakt voor deze offerte", factuurId: offerte.facturen[0].id },
        { status: 400 }
      );
    }

    const factuurNummer = await generateFactuurNummer();
    const now = new Date();
    const vervaldatum = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const factuur = await prisma.factuur.create({
      data: {
        factuurNummer,
        datum: now,
        vervaldatum,
        klantId: offerte.klantId,
        projectId: offerte.projectId,
        projectNaam: offerte.projectNaam,
        projectLocatie: offerte.projectLocatie,
        offerteId: offerte.id,
        subtotaal: offerte.subtotaal,
        btwPercentage: offerte.btwPercentage,
        btwBedrag: offerte.btwBedrag,
        totaal: offerte.totaal,
        status: "Onbetaald",
        items: {
          create: offerte.items.map((item, index) => ({
            omschrijving: item.omschrijving,
            aantal: item.aantal,
            eenheid: item.eenheid,
            prijsPerEenheid: item.prijsPerEenheid,
            totaal: item.totaal,
            btwTarief: item.btwTarief,
            btwBedrag: item.btwBedrag,
            volgorde: index,
          })),
        },
      },
      include: {
        klant: true,
        items: true,
      },
    });

    return NextResponse.json(factuur, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, "factuur aanmaken vanuit offerte");
  }
}
