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

    const offerte = await prisma.offerte.findUnique({
      where: { id },
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

    return NextResponse.json(offerte);
  } catch (error) {
    console.error("Error fetching offerte:", error);
    return NextResponse.json(
      { error: "Failed to fetch offerte" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    await prisma.offerteItem.deleteMany({
      where: { offerteId: id },
    });

    const offerte = await prisma.offerte.update({
      where: { id: id },
      data: {
        datum: new Date(data.datum),
        geldigTot: new Date(data.geldigTot),
        klantId: data.klantId,
        projectNaam: data.projectNaam,
        projectLocatie: data.projectLocatie || null,
        subtotaal,
        btwPercentage: data.btwPercentage,
        btwBedrag,
        totaal,
        status: data.status,
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

    return NextResponse.json(offerte);
  } catch (error) {
    console.error("Error updating offerte:", error);
    return NextResponse.json(
      { error: "Failed to update offerte" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.offerte.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Offerte deleted" });
  } catch (error) {
    console.error("Error deleting offerte:", error);
    return NextResponse.json(
      { error: "Failed to delete offerte" },
      { status: 500 }
    );
  }
}

