import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { expensePatchSchema } from "@/lib/validations/expense";
import { handleApiError, validationError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const klantId = searchParams.get("klantId");
    const offerteId = searchParams.get("offerteId");
    const factuurId = searchParams.get("factuurId");
    const status = searchParams.get("status");
    const categorie = searchParams.get("categorie");

    const where: Prisma.ExpenseWhereInput = {};
    if (klantId) where.klantId = klantId;
    if (offerteId) where.offerteId = offerteId;
    if (factuurId) where.factuurId = factuurId;
    if (status) where.status = status;
    if (categorie) where.categorie = categorie;
    const projectId = searchParams.get("projectId");
    if (projectId) where.projectId = projectId;

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        klant: {
          select: {
            id: true,
            naam: true,
          },
        },
        offerte: {
          select: {
            id: true,
            offerteNummer: true,
            projectNaam: true,
          },
        },
        factuur: {
          select: {
            id: true,
            factuurNummer: true,
            projectNaam: true,
          },
        },
        project: {
          select: {
            id: true,
            projectNummer: true,
            naam: true,
          },
        },
      },
      orderBy: {
        datum: "desc",
      },
    });

    // Calculate totals
    const totals = {
      count: expenses.length,
      totalBedrag: expenses.reduce((sum, exp) => sum + exp.bedrag, 0),
      totalBtw: expenses.reduce((sum, exp) => sum + exp.btw, 0),
      totalAmount: expenses.reduce((sum, exp) => sum + exp.totaalBedrag, 0),
    };

    return NextResponse.json({ expenses, totals });
  } catch (error: unknown) {
    return handleApiError(error, "ophalen van uitgaven");
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Kosten ID is verplicht" }, { status: 400 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Kosten verwijderd" });
  } catch (error: unknown) {
    return handleApiError(error, "verwijderen van uitgave");
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Kosten ID is verplicht" }, { status: 400 });
    }

    const result = expensePatchSchema.safeParse(data);
    if (!result.success) {
      return validationError(Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])));
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: result.data,
      include: {
        klant: true,
        offerte: true,
        factuur: true,
        project: true,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: unknown) {
    return handleApiError(error, "bijwerken van uitgave");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const { datum, categorie, omschrijving, bedrag, btw, totaalBedrag, projectId, notities } = body;

    if (!omschrijving || bedrag === undefined || totaalBedrag === undefined) {
      return NextResponse.json({ error: "Omschrijving, bedrag en totaalbedrag zijn verplicht" }, { status: 400 });
    }

    const validCategories = ["Materialen", "Transport", "Gereedschap", "Voertuig", "Abonnementen", "Onderaanneming", "Overig"];
    if (!categorie || !validCategories.includes(categorie)) {
      return NextResponse.json({ error: "Ongeldige categorie" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        datum: datum ? new Date(datum) : new Date(),
        categorie,
        omschrijving,
        bedrag: Math.round(Number(bedrag)),
        btw: Math.round(Number(btw) || 0),
        totaalBedrag: Math.round(Number(totaalBedrag)),
        projectId: projectId || null,
        notities: notities || null,
        status: "approved",
        uploadedVia: "web",
      },
      include: {
        project: { select: { id: true, projectNummer: true, naam: true } },
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: unknown) {
    return handleApiError(error, "aanmaken van uitgave");
  }
}

