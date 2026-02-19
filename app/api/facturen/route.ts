import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { generateFactuurNummer } from "@/lib/number-generator";
import { factuurCreateSchema, FactuurItem } from "@/lib/validations/factuur";
import { handleApiError, validationError } from "@/lib/api-error";
import { calculateItemBtw, BtwTarief } from "@/lib/btw";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const facturen = await prisma.factuur.findMany({
      orderBy: { datum: "desc" },
      include: {
        klant: true,
        project: { select: { id: true, projectNummer: true, naam: true } },
        items: {
          orderBy: { volgorde: "asc" },
        },
      },
    });

    return NextResponse.json(facturen);
  } catch (error: unknown) {
    return handleApiError(error, "facturen ophalen");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const result = factuurCreateSchema.safeParse(body);

    if (!result.success) {
      return validationError(Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])));
    }

    const data = result.data;

    // Generate factuur number
    const factuurNummer = await generateFactuurNummer();

    // Calculate totals with per-item BTW
    const itemsWithBtw = data.items.map((item: FactuurItem) => {
      const subtotalCents = Math.round(item.totaal * 100);
      const tarief = (item.btwTarief || "HOOG_21") as BtwTarief;
      const btwBedrag = calculateItemBtw(subtotalCents, tarief);
      return { ...item, subtotalCents, tarief, btwBedrag };
    });

    const subtotaalCents = itemsWithBtw.reduce((sum, item) => sum + item.subtotalCents, 0);
    const btwBedragCents = itemsWithBtw.reduce((sum, item) => sum + item.btwBedrag, 0);
    const totaalCents = subtotaalCents + btwBedragCents;

    const factuur = await prisma.factuur.create({
      data: {
        factuurNummer,
        datum: new Date(data.datum),
        vervaldatum: new Date(data.vervaldatum),
        klantId: data.klantId,
        projectId: data.projectId || null,
        projectNaam: data.projectNaam,
        projectLocatie: data.projectLocatie || null,
        subtotaal: subtotaalCents,
        btwPercentage: data.btwPercentage ?? 21,
        btwBedrag: btwBedragCents,
        totaal: totaalCents,
        status: data.status || "Onbetaald",
        betaaldBedrag: data.betaaldBedrag ? Math.round(data.betaaldBedrag * 100) : 0,
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

    return NextResponse.json(factuur, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, "factuur aanmaken");
  }
}
