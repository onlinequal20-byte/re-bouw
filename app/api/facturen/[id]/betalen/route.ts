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

    // Get invoice
    const factuur = await prisma.factuur.findUnique({
      where: { id },
      include: {
        klant: true,
      },
    });

    if (!factuur) {
      return NextResponse.json({ error: "Factuur niet gevonden" }, { status: 404 });
    }

    // Check if already paid
    if (factuur.status === "Betaald") {
      return NextResponse.json({ error: "Factuur is al betaald" }, { status: 400 });
    }

    // Calculate remaining amount
    const remainingAmount = factuur.totaal - factuur.betaaldBedrag;

    if (remainingAmount <= 0) {
      return NextResponse.json({ error: "Geen openstaand bedrag" }, { status: 400 });
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Create Mollie payment
    const payment = await createPayment({
      amount: remainingAmount,
      description: `Betaling factuur ${factuur.factuurNummer}`,
      redirectUrl: `${baseUrl}/betaling/status?factuurId=${factuur.id}`,
      webhookUrl: `${baseUrl}/api/webhooks/mollie`,
      metadata: {
        factuurId: factuur.id,
        factuurNummer: factuur.factuurNummer,
        klantId: factuur.klantId,
      },
    });

    // Store payment ID in database
    await prisma.factuur.update({
      where: { id },
      data: {
        notities: factuur.notities
          ? `${factuur.notities}\n\nMollie Payment ID: ${payment.id}`
          : `Mollie Payment ID: ${payment.id}`,
      },
    });

    return NextResponse.json({
      paymentUrl: payment.getCheckoutUrl(),
      paymentId: payment.id,
      amount: remainingAmount,
    });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}

