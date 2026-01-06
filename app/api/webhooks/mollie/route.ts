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

    // Get metadata
    const metadata = payment.metadata as { 
      factuurId?: string; 
      offerteId?: string; 
      type?: string;
    } | null | undefined;
    
    const type = metadata?.type;
    const factuurId = metadata?.factuurId;
    const offerteId = metadata?.offerteId;

    // Handle offerte prepayment
    if (type === 'offerte_prepayment' && offerteId) {
      const offerte = await prisma.offerte.findUnique({
        where: { id: offerteId },
      });

      if (!offerte) {
        console.error(`Offerte ${offerteId} not found`);
        return NextResponse.json({ error: "Offerte not found" }, { status: 404 });
      }

      if (payment.status === 'paid') {
        const paidAmount = parseFloat(payment.amount.value);

        await prisma.offerte.update({
          where: { id: offerteId },
          data: {
            vooruitbetaald: true,
            notities: offerte.notities
              ? `${offerte.notities}\n\nVooruitbetaling ontvangen via iDEAL op ${new Date().toLocaleString('nl-NL')}\nMollie Payment ID: ${paymentId}\nBedrag: €${paidAmount.toFixed(2)}`
              : `Vooruitbetaling ontvangen via iDEAL op ${new Date().toLocaleString('nl-NL')}\nMollie Payment ID: ${paymentId}\nBedrag: €${paidAmount.toFixed(2)}`,
          },
        });

        console.log(`Offerte ${offerte.offerteNummer} prepayment received`);
      } else if (payment.status === 'failed' || payment.status === 'expired' || payment.status === 'canceled') {
        await prisma.offerte.update({
          where: { id: offerteId },
          data: {
            notities: offerte.notities
              ? `${offerte.notities}\n\nVooruitbetaling mislukt/geannuleerd op ${new Date().toLocaleString('nl-NL')}\nMollie Payment ID: ${paymentId}\nStatus: ${payment.status}`
              : `Vooruitbetaling mislukt/geannuleerd op ${new Date().toLocaleString('nl-NL')}\nMollie Payment ID: ${paymentId}\nStatus: ${payment.status}`,
          },
        });

        console.log(`Payment ${paymentId} failed/expired/canceled for offerte ${offerte.offerteNummer}`);
      }

      return NextResponse.json({ success: true });
    }

    // Handle invoice payment
    if (factuurId) {
      const factuur = await prisma.factuur.findUnique({
        where: { id: factuurId },
      });

      if (!factuur) {
        console.error(`Invoice ${factuurId} not found`);
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

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
    }

    // No valid ID found
    console.error("No valid factuurId or offerteId in payment metadata");
    return NextResponse.json({ error: "No valid document ID in metadata" }, { status: 400 });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

