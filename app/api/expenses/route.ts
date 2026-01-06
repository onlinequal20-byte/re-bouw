import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const klantId = searchParams.get("klantId");
    const offerteId = searchParams.get("offerteId");
    const factuurId = searchParams.get("factuurId");
    const status = searchParams.get("status");
    const categorie = searchParams.get("categorie");

    const where: any = {};
    if (klantId) where.klantId = klantId;
    if (offerteId) where.offerteId = offerteId;
    if (factuurId) where.factuurId = factuurId;
    if (status) where.status = status;
    if (categorie) where.categorie = categorie;

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
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Expense ID required" }, { status: 400 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Expense deleted" });
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete expense" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Expense ID required" }, { status: 400 });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data,
      include: {
        klant: true,
        offerte: true,
        factuur: true,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update expense" },
      { status: 500 }
    );
  }
}

