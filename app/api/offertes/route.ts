import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOfferteNummer } from "@/lib/number-generator";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offertes = await prisma.offerte.findMany({
      orderBy: { datum: "desc" },
      include: {
        klant: true,
        items: {
          orderBy: { volgorde: "asc" },
        },
      },
    });

    return NextResponse.json(offertes);
  } catch (error) {
    console.error("Error fetching offertes:", error);
    return NextResponse.json(
      { error: "Failed to fetch offertes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Generate offerte number
    const offerteNummer = await generateOfferteNummer();

    // Calculate totals
    const subtotaal = data.items.reduce((sum: number, item: any) => sum + item.totaal, 0);
    const btwBedrag = subtotaal * (data.btwPercentage / 100);
    const totaal = subtotaal + btwBedrag;

    const offerte = await prisma.offerte.create({
      data: {
        offerteNummer,
        datum: new Date(data.datum),
        geldigTot: new Date(data.geldigTot),
        klantId: data.klantId,
        projectNaam: data.projectNaam,
        projectLocatie: data.projectLocatie || null,
        subtotaal,
        btwPercentage: data.btwPercentage,
        btwBedrag,
        totaal,
        status: data.status || "Concept",
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

    return NextResponse.json(offerte, { status: 201 });
  } catch (error) {
    console.error("Error creating offerte:", error);
    return NextResponse.json(
      { error: "Failed to create offerte" },
      { status: 500 }
    );
  }
}

