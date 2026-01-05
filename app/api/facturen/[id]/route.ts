import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "Factuur not found" }, { status: 404 });
    }

    return NextResponse.json(factuur);
  } catch (error) {
    console.error("Error fetching factuur:", error);
    return NextResponse.json(
      { error: "Failed to fetch factuur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Calculate totals
    const subtotaal = data.items.reduce((sum: number, item: any) => sum + item.totaal, 0);
    const btwBedrag = subtotaal * (data.btwPercentage / 100);
    const totaal = subtotaal + btwBedrag;

    // Delete existing items
    await prisma.factuurItem.deleteMany({
      where: { factuurId: id },
    });

    const factuur = await prisma.factuur.update({
      where: { id: id },
      data: {
        datum: new Date(data.datum),
        vervaldatum: new Date(data.vervaldatum),
        klantId: data.klantId,
        projectNaam: data.projectNaam,
        projectLocatie: data.projectLocatie || null,
        subtotaal,
        btwPercentage: data.btwPercentage,
        btwBedrag,
        totaal,
        status: data.status,
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

    return NextResponse.json(factuur);
  } catch (error) {
    console.error("Error updating factuur:", error);
    return NextResponse.json(
      { error: "Failed to update factuur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.factuur.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Factuur deleted" });
  } catch (error) {
    console.error("Error deleting factuur:", error);
    return NextResponse.json(
      { error: "Failed to delete factuur" },
      { status: 500 }
    );
  }
}

