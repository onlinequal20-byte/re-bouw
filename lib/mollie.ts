import { createMollieClient, PaymentMethod } from '@mollie/api-client';
import { prisma } from './prisma';

export async function getMollieClient() {
  // Get Mollie API key from settings
  const apiKeySetting = await prisma.settings.findUnique({
    where: { key: 'mollie_api_key' },
  });

  if (!apiKeySetting?.value) {
    throw new Error('Mollie API key not configured');
  }

  return createMollieClient({ apiKey: apiKeySetting.value });
}

interface CreatePaymentParams {
  /** Amount in integer cents */
  amount: number;
  description: string;
  redirectUrl: string;
  webhookUrl?: string;
  metadata?: Record<string, string>;
}

export async function createPayment({
  amount,
  description,
  redirectUrl,
  webhookUrl,
  metadata,
}: CreatePaymentParams) {
  const mollie = await getMollieClient();

  const payment = await mollie.payments.create({
    amount: {
      currency: 'EUR',
      value: (amount / 100).toFixed(2),
    },
    description,
    redirectUrl,
    webhookUrl,
    metadata,
    method: PaymentMethod.ideal,
  });

  return payment;
}

export async function getPayment(paymentId: string) {
  const mollie = await getMollieClient();
  return await mollie.payments.get(paymentId);
}

/**
 * Verify a webhook by fetching the payment from Mollie API.
 * Returns the payment object if valid, or null if the payment doesn't exist.
 * This is Mollie's recommended verification approach: fetch the payment
 * from their API using the provided ID to confirm it's genuine.
 */
export async function verifyWebhookPayment(paymentId: string) {
  try {
    const mollie = await getMollieClient();
    return await mollie.payments.get(paymentId);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to verify webhook payment ${paymentId}: ${message}`);
    return null;
  }
}

export async function getPaymentMethods() {
  const mollie = await getMollieClient();
  return await mollie.methods.list();
}
