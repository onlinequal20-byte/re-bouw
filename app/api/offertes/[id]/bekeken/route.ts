import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const offerte = await prisma.offerte.findUnique({
      where: { id },
    });

    if (!offerte) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }

    // Only update if not already viewed and status is Verzonden
    if (!offerte.bekeken && offerte.status === "Verzonden") {
      await prisma.offerte.update({
        where: { id },
        data: {
          bekeken: true,
          bekekenOp: new Date(),
          status: "Bekeken",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking offerte as viewed:", error);
    return NextResponse.json({ error: "Fout" }, { status: 500 });
  }
}
