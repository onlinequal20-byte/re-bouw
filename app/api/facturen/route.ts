import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { generateFactuurNummer } from "@/lib/number-generator";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const facturen = await prisma.factuur.findMany({
      orderBy: { datum: "desc" },
      include: {
        klant: true,
        items: {
          orderBy: { volgorde: "asc" },
        },
      },
    });

    return NextResponse.json(facturen);
  } catch (error) {
    console.error("Error fetching facturen:", error);
    return NextResponse.json(
      { error: "Failed to fetch facturen" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Generate factuur number
    const factuurNummer = await generateFactuurNummer();

    // Calculate totals
    const subtotaal = data.items.reduce((sum: number, item: any) => sum + item.totaal, 0);
    const btwBedrag = subtotaal * (data.btwPercentage / 100);
    const totaal = subtotaal + btwBedrag;

    const factuur = await prisma.factuur.create({
      data: {
        factuurNummer,
        datum: new Date(data.datum),
        vervaldatum: new Date(data.vervaldatum),
        klantId: data.klantId,
        projectNaam: data.projectNaam,
        projectLocatie: data.projectLocatie || null,
        subtotaal,
        btwPercentage: data.btwPercentage,
        btwBedrag,
        totaal,
        status: data.status || "Onbetaald",
        betaaldBedrag: data.betaaldBedrag || 0,
        notities: data.notities || null,
        items: {
          create: data.items.map((item: any, index: number) => ({
            omschrijving: item.omschrijving,
            aantal: item.aantal,
            eenheid: item.eenheid,
            prijsPerEenheid: item.prijsPerEenheid,
            totaal: item.totaal,
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
  } catch (error) {
    console.error("Error creating factuur:", error);
    return NextResponse.json(
      { error: "Failed to create factuur" },
      { status: 500 }
    );
  }
}

