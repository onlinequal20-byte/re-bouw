import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { generateOfferteNummer } from "@/lib/number-generator";
import { offerteCreateSchema, OfferteItem } from "@/lib/validations/offerte";
import { handleApiError, validationError } from "@/lib/api-error";
import { calculateItemBtw, BtwTarief } from "@/lib/btw";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const offertes = await prisma.offerte.findMany({
      orderBy: { datum: "desc" },
      include: {
        klant: true,
        project: { select: { id: true, projectNummer: true, naam: true } },
        items: {
          orderBy: { volgorde: "asc" },
        },
      },
    });

    // Auto-expire: mark Verzonden + expired + unsigned as Verlopen
    const now = new Date();
    const expiredIds: string[] = [];
    for (const offerte of offertes) {
      if (
        offerte.status === "Verzonden" &&
        new Date(offerte.geldigTot) < now &&
        !offerte.klantHandtekening
      ) {
        expiredIds.push(offerte.id);
        offerte.status = "Verlopen";
      }
    }
    if (expiredIds.length > 0) {
      await prisma.offerte.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: "Verlopen" },
      });
    }

    return NextResponse.json(offertes);
  } catch (error: unknown) {
    return handleApiError(error, "offertes ophalen");
  }
}

export async function POST(request: Request) {
  try {
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

    // Generate offerte number
    const offerteNummer = await generateOfferteNummer();

    // Calculate totals — convert euro inputs to integer cents, with per-item BTW
    const itemsWithBtw = data.items.map((item: OfferteItem) => {
      const subtotalCents = Math.round(item.totaal * 100);
      const tarief = (item.btwTarief || "HOOG_21") as BtwTarief;
      const btwBedrag = calculateItemBtw(subtotalCents, tarief);
      return { ...item, subtotalCents, tarief, btwBedrag };
    });

    const subtotaalCents = itemsWithBtw.reduce((sum, item) => sum + item.subtotalCents, 0);
    const btwBedragCents = itemsWithBtw.reduce((sum, item) => sum + item.btwBedrag, 0);
    const totaalCents = subtotaalCents + btwBedragCents;

    const offerte = await prisma.offerte.create({
      data: {
        offerteNummer,
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
        status: data.status || "Concept",
        notities: data.notities || null,
        items: {
          create: itemsWithBtw.map((item, index: number) => ({
            omschrijving: item.omschrijving,
            beschrijving: item.beschrijving || null,
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

    return NextResponse.json(offerte, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, "offerte aanmaken");
  }
}
