import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prijslijst = await prisma.prijslijst.findMany({
      where: { actief: true },
      orderBy: [{ categorie: "asc" }, { omschrijving: "asc" }],
    });

    return NextResponse.json(prijslijst);
  } catch (error) {
    console.error("Error fetching prijslijst:", error);
    return NextResponse.json(
      { error: "Failed to fetch prijslijst" },
      { status: 500 }
    );
  }
}

