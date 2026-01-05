import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const signSchema = z.object({
  signature: z.string().min(1, "Handtekening is verplicht"),
  naam: z.string().min(1, "Naam is verplicht"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signature, naam } = signSchema.parse(body);

    // Get client IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";

    // Check if factuur exists
    const factuur = await prisma.factuur.findUnique({
      where: { id: id },
    });

    if (!factuur) {
      return NextResponse.json(
        { error: "Factuur niet gevonden" },
        { status: 404 }
      );
    }

    // Check if already signed
    if (factuur.klantHandtekening) {
      return NextResponse.json(
        { error: "Factuur is al ondertekend" },
        { status: 400 }
      );
    }

    // Update factuur with signature
    const updated = await prisma.factuur.update({
      where: { id: id },
      data: {
        klantHandtekening: signature,
        klantNaam: naam,
        klantGetekendOp: new Date(),
        klantIpAdres: ip,
        algemeneVoorwaardenUrl: "/algemene-voorwaarden.txt",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Factuur succesvol ondertekend",
      factuur: updated,
    });
  } catch (error) {
    console.error("Error signing factuur:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ongeldige gegevens", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het ondertekenen" },
      { status: 500 }
    );
  }
}

