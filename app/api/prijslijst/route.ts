import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
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

