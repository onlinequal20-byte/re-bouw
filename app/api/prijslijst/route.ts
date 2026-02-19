import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const prijsSchema = z.object({
  categorie: z.string().min(1, "Categorie is verplicht"),
  omschrijving: z.string().min(1, "Omschrijving is verplicht"),
  prijsPerEenheid: z.number().min(0, "Prijs moet positief zijn"),
  eenheid: z.string().min(1, "Eenheid is verplicht"),
  materiaalKosten: z.number().min(0, "Materiaalkosten moeten positief zijn").default(0),
  actief: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const prijslijst = await prisma.prijslijst.findMany({
      orderBy: [{ categorie: "asc" }, { omschrijving: "asc" }],
    });

    return NextResponse.json(prijslijst);
  } catch (error) {
    console.error("Error fetching prijslijst:", error);
    return NextResponse.json(
      { error: "Prijslijst ophalen mislukt" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const data = prijsSchema.parse(body);

    const prijs = await prisma.prijslijst.create({
      data: {
        ...data,
        prijsPerEenheid: Math.round(data.prijsPerEenheid * 100),
        materiaalKosten: Math.round(data.materiaalKosten * 100),
      },
    });

    return NextResponse.json(prijs);
  } catch (error) {
    console.error("Error creating prijs:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ongeldige gegevens", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Prijs aanmaken mislukt" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is verplicht" }, { status: 400 });
    }

    const validated = prijsSchema.parse(data);

    const prijs = await prisma.prijslijst.update({
      where: { id },
      data: {
        ...validated,
        prijsPerEenheid: Math.round(validated.prijsPerEenheid * 100),
        materiaalKosten: Math.round(validated.materiaalKosten * 100),
      },
    });

    return NextResponse.json(prijs);
  } catch (error) {
    console.error("Error updating prijs:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ongeldige gegevens", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Prijs bijwerken mislukt" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "ID is verplicht" }, { status: 400 });
    }

    await prisma.prijslijst.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prijs:", error);
    return NextResponse.json(
      { error: "Prijs verwijderen mislukt" },
      { status: 500 }
    );
  }
}

