import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/simple-auth";
import { createPayment } from "@/lib/mollie";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get("public") === "true";

    // Allow public access for payment links
    if (!isPublic) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Get offerte
    const offerte = await prisma.offerte.findUnique({
      where: { id },
      include: { klant: true },
    });

    if (!offerte) {
      return NextResponse.json({ error: "Offerte niet gevonden" }, { status: 404 });
    }

    // Check if offerte is accepted
    if (offerte.status !== "Getekend") {
      return NextResponse.json(
        { error: "Offerte moet eerst worden getekend" },
        { status: 400 }
      );
    }

    // Check if already paid
    if (offerte.vooruitbetaald) {
      return NextResponse.json(
        { error: "Vooruitbetaling is reeds ontvangen" },
        { status: 400 }
      );
    }

    // Calculate prepayment amount (30%) — totaal is in cents
    const prepaymentAmount = Math.round(offerte.totaal * 0.3);

    // Create Mollie payment
    const payment = await createPayment({
      amount: prepaymentAmount,
      description: `Vooruitbetaling Offerte ${offerte.offerteNummer} - ${offerte.projectNaam}`,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/betaling/status?offerteId=${offerte.id}&type=offerte`,
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mollie`,
      metadata: {
        offerteId: offerte.id,
        klantId: offerte.klantId,
        type: 'offerte_prepayment',
      },
    });

    // Log payment attempt
    await prisma.offerte.update({
      where: { id: offerte.id },
      data: {
        notities: offerte.notities
          ? `${offerte.notities}\n\nVooruitbetaling gestart via iDEAL op ${new Date().toLocaleString('nl-NL')}\nMollie Payment ID: ${payment.id}\nBedrag: €${(prepaymentAmount / 100).toFixed(2)}`
          : `Vooruitbetaling gestart via iDEAL op ${new Date().toLocaleString('nl-NL')}\nMollie Payment ID: ${payment.id}\nBedrag: €${(prepaymentAmount / 100).toFixed(2)}`,
      },
    });

    return NextResponse.json({ checkoutUrl: payment.getCheckoutUrl() });
  } catch (error: any) {
    console.error("Error creating offerte payment:", error);
    return NextResponse.json(
      { error: error.message || "Fout bij aanmaken betaling" },
      { status: 500 }
    );
  }
}

