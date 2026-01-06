import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mollie";

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const paymentId = body.get("id") as string;

    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID provided" }, { status: 400 });
    }

    // Get payment status from Mollie
    const payment = await getPayment(paymentId);

    // Get invoice from metadata
    const metadata = payment.metadata as { factuurId?: string } | null | undefined;
    const factuurId = metadata?.factuurId;

    if (!factuurId) {
      console.error("No factuurId in payment metadata");
      return NextResponse.json({ error: "No invoice ID in metadata" }, { status: 400 });
    }

    // Get invoice
    const factuur = await prisma.factuur.findUnique({
      where: { id: factuurId },
    });

    if (!factuur) {
      console.error(`Invoice ${factuurId} not found`);
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Update invoice based on payment status
    if (payment.status === 'paid') {
      const paidAmount = parseFloat(payment.amount.value);

      await prisma.factuur.update({
        where: { id: factuurId },
        data: {
          status: "Betaald",
          betaaldBedrag: factuur.betaaldBedrag + paidAmount,
          notities: factuur.notities
            ? `${factuur.notities}\n\nBetaald via iDEAL op ${new Date().toLocaleString('nl-NL')}\nMollie Payment ID: ${paymentId}\nBedrag: €${paidAmount.toFixed(2)}`
            : `Betaald via iDEAL op ${new Date().toLocaleString('nl-NL')}\nMollie Payment ID: ${paymentId}\nBedrag: €${paidAmount.toFixed(2)}`,
        },
      });

      console.log(`Invoice ${factuur.factuurNummer} marked as paid`);
    } else if (payment.status === 'failed' || payment.status === 'expired' || payment.status === 'canceled') {
      await prisma.factuur.update({
        where: { id: factuurId },
        data: {
          notities: factuur.notities
            ? `${factuur.notities}\n\nBetaling mislukt/geannuleerd op ${new Date().toLocaleString('nl-NL')}\nMollie Payment ID: ${paymentId}\nStatus: ${payment.status}`
            : `Betaling mislukt/geannuleerd op ${new Date().toLocaleString('nl-NL')}\nMollie Payment ID: ${paymentId}\nStatus: ${payment.status}`,
        },
      });

      console.log(`Payment ${paymentId} failed/expired/canceled for invoice ${factuur.factuurNummer}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

