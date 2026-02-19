import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookPayment } from "@/lib/mollie";

/**
 * Mollie webhook handler.
 * Always returns 200 to Mollie to prevent unnecessary retries.
 * Verifies payment by fetching from Mollie API (recommended approach).
 * Uses molliePaymentId field for idempotency to prevent double-counting.
 */
export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const paymentId = body.get("id");

    if (typeof paymentId !== "string" || !paymentId) {
      console.error("Webhook: No payment ID provided");
      return NextResponse.json({ status: "ok" });
    }

    // Verify payment by fetching from Mollie API
    // This rejects forged webhooks with fake payment IDs
    const payment = await verifyWebhookPayment(paymentId);

    if (!payment) {
      console.error(`Webhook: Payment ${paymentId} not found in Mollie API (possible forged webhook)`);
      return NextResponse.json({ status: "ok" });
    }

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
    if (type === "offerte_prepayment" && offerteId) {
      await handleOffertePrepayment(offerteId, paymentId, payment);
      return NextResponse.json({ status: "ok" });
    }

    // Handle invoice payment
    if (factuurId) {
      await handleFactuurPayment(factuurId, paymentId, payment);
      return NextResponse.json({ status: "ok" });
    }

    console.error("Webhook: No valid factuurId or offerteId in payment metadata");
    return NextResponse.json({ status: "ok" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Webhook error:", message);
    // Always return 200 to Mollie to prevent retries
    return NextResponse.json({ status: "ok" });
  }
}

interface MolliePayment {
  status: string;
  amount: { value: string };
}

async function handleOffertePrepayment(
  offerteId: string,
  paymentId: string,
  payment: MolliePayment
) {
  const offerte = await prisma.offerte.findUnique({
    where: { id: offerteId },
  });

  if (!offerte) {
    console.error(`Webhook: Offerte ${offerteId} not found`);
    return;
  }

  // Idempotency check: skip if this payment was already processed
  if (offerte.molliePaymentId === paymentId) {
    console.log(`Webhook: Payment ${paymentId} already processed for offerte ${offerte.offerteNummer}, skipping`);
    return;
  }

  if (payment.status === "paid") {
    const paidAmountCents = Math.round(parseFloat(payment.amount.value) * 100);

    await prisma.offerte.update({
      where: { id: offerteId },
      data: {
        vooruitbetaald: true,
        molliePaymentId: paymentId,
        notities: offerte.notities
          ? `${offerte.notities}\n\nVooruitbetaling ontvangen via iDEAL op ${new Date().toLocaleString("nl-NL")}\nMollie Payment ID: ${paymentId}\nBedrag: \u20AC${(paidAmountCents / 100).toFixed(2)}`
          : `Vooruitbetaling ontvangen via iDEAL op ${new Date().toLocaleString("nl-NL")}\nMollie Payment ID: ${paymentId}\nBedrag: \u20AC${(paidAmountCents / 100).toFixed(2)}`,
      },
    });

    console.log(`Webhook: Offerte ${offerte.offerteNummer} prepayment received`);
  } else if (
    payment.status === "failed" ||
    payment.status === "expired" ||
    payment.status === "canceled"
  ) {
    await prisma.offerte.update({
      where: { id: offerteId },
      data: {
        molliePaymentId: paymentId,
        notities: offerte.notities
          ? `${offerte.notities}\n\nVooruitbetaling mislukt/geannuleerd op ${new Date().toLocaleString("nl-NL")}\nMollie Payment ID: ${paymentId}\nStatus: ${payment.status}`
          : `Vooruitbetaling mislukt/geannuleerd op ${new Date().toLocaleString("nl-NL")}\nMollie Payment ID: ${paymentId}\nStatus: ${payment.status}`,
      },
    });

    console.log(`Webhook: Payment ${paymentId} ${payment.status} for offerte ${offerte.offerteNummer}`);
  }
}

async function handleFactuurPayment(
  factuurId: string,
  paymentId: string,
  payment: MolliePayment
) {
  const factuur = await prisma.factuur.findUnique({
    where: { id: factuurId },
  });

  if (!factuur) {
    console.error(`Webhook: Invoice ${factuurId} not found`);
    return;
  }

  // Idempotency check: skip if this payment was already processed
  if (factuur.molliePaymentId === paymentId) {
    console.log(`Webhook: Payment ${paymentId} already processed for invoice ${factuur.factuurNummer}, skipping`);
    return;
  }

  if (payment.status === "paid") {
    const paidAmountCents = Math.round(parseFloat(payment.amount.value) * 100);
    const newBetaaldBedrag = factuur.betaaldBedrag + paidAmountCents;
    const newStatus = newBetaaldBedrag >= factuur.totaal ? "Betaald" : "Deels betaald";

    await prisma.factuur.update({
      where: { id: factuurId },
      data: {
        status: newStatus,
        betaaldBedrag: newBetaaldBedrag,
        molliePaymentId: paymentId,
        notities: factuur.notities
          ? `${factuur.notities}\n\nBetaald via iDEAL op ${new Date().toLocaleString("nl-NL")}\nMollie Payment ID: ${paymentId}\nBedrag: \u20AC${(paidAmountCents / 100).toFixed(2)}`
          : `Betaald via iDEAL op ${new Date().toLocaleString("nl-NL")}\nMollie Payment ID: ${paymentId}\nBedrag: \u20AC${(paidAmountCents / 100).toFixed(2)}`,
      },
    });

    console.log(`Webhook: Invoice ${factuur.factuurNummer} marked as ${newStatus}`);
  } else if (
    payment.status === "failed" ||
    payment.status === "expired" ||
    payment.status === "canceled"
  ) {
    await prisma.factuur.update({
      where: { id: factuurId },
      data: {
        molliePaymentId: paymentId,
        notities: factuur.notities
          ? `${factuur.notities}\n\nBetaling mislukt/geannuleerd op ${new Date().toLocaleString("nl-NL")}\nMollie Payment ID: ${paymentId}\nStatus: ${payment.status}`
          : `Betaling mislukt/geannuleerd op ${new Date().toLocaleString("nl-NL")}\nMollie Payment ID: ${paymentId}\nStatus: ${payment.status}`,
      },
    });

    console.log(`Webhook: Payment ${paymentId} ${payment.status} for invoice ${factuur.factuurNummer}`);
  }
}
