import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const klanten = await prisma.klant.findMany({
      orderBy: { naam: "asc" },
    });

    return NextResponse.json(klanten);
  } catch (error) {
    console.error("Error fetching klanten:", error);
    return NextResponse.json(
      { error: "Failed to fetch klanten" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const klant = await prisma.klant.create({
      data: {
        naam: data.naam,
        email: data.email || null,
        telefoon: data.telefoon || null,
        adres: data.adres || null,
        postcode: data.postcode || null,
        plaats: data.plaats || null,
        kvkNummer: data.kvkNummer || null,
        notities: data.notities || null,
      },
    });

    return NextResponse.json(klant, { status: 201 });
  } catch (error) {
    console.error("Error creating klant:", error);
    return NextResponse.json(
      { error: "Failed to create klant" },
      { status: 500 }
    );
  }
}

