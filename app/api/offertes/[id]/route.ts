import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { offerteCreateSchema, OfferteItem } from "@/lib/validations/offerte";
import { handleApiError, validationError } from "@/lib/api-error";
import { calculateItemBtw, BtwTarief } from "@/lib/btw";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if this is a public request (for signing page)
    const url = new URL(request.url);
    const isPublic = url.searchParams.get('public') === 'true';

    if (!isPublic) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
      }
    }

    const offerte = await prisma.offerte.findUnique({
      where: { id },
      include: {
        klant: true,
        project: { select: { id: true, projectNummer: true, naam: true } },
        items: {
          orderBy: { volgorde: "asc" },
        },
      },
    });

    if (!offerte) {
      return NextResponse.json({ error: "Offerte niet gevonden" }, { status: 404 });
    }

    // Auto-expire: if Verzonden and past geldigTot and unsigned, mark as Verlopen
    if (
      offerte.status === "Verzonden" &&
      new Date(offerte.geldigTot) < new Date() &&
      !offerte.klantHandtekening
    ) {
      await prisma.offerte.update({
        where: { id },
        data: { status: "Verlopen" },
      });
      offerte.status = "Verlopen";
    }

    return NextResponse.json(offerte);
  } catch (error: unknown) {
    return handleApiError(error, "offerte ophalen");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const result = offerteCreateSchema.safeParse(body);

    if (!result.success) {
      return validationError(Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])));
    }

    const data = result.data;

    // Calculate totals with per-item BTW
    const itemsWithBtw = data.items.map((item: OfferteItem) => {
      const subtotalCents = Math.round(item.totaal * 100);
      const tarief = (item.btwTarief || "HOOG_21") as BtwTarief;
      const btwBedrag = calculateItemBtw(subtotalCents, tarief);
      return { ...item, subtotalCents, tarief, btwBedrag };
    });

    const subtotaalCents = itemsWithBtw.reduce((sum, item) => sum + item.subtotalCents, 0);
    const btwBedragCents = itemsWithBtw.reduce((sum, item) => sum + item.btwBedrag, 0);
    const totaalCents = subtotaalCents + btwBedragCents;

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
        projectId: data.projectId || null,
        projectNaam: data.projectNaam,
        projectLocatie: data.projectLocatie || null,
        subtotaal: subtotaalCents,
        btwPercentage: data.btwPercentage ?? 21,
        btwBedrag: btwBedragCents,
        totaal: totaalCents,
        status: data.status,
        notities: data.notities || null,
        items: {
          create: itemsWithBtw.map((item, index: number) => ({
            omschrijving: item.omschrijving,
            aantal: item.aantal,
            eenheid: item.eenheid,
            prijsPerEenheid: Math.round(item.prijsPerEenheid * 100),
            totaal: item.subtotalCents,
            btwTarief: item.tarief,
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

    return NextResponse.json(offerte);
  } catch (error: unknown) {
    return handleApiError(error, "offerte bijwerken");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    await prisma.offerte.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Offerte verwijderd" });
  } catch (error: unknown) {
    return handleApiError(error, "offerte verwijderen");
  }
}
