import { createMollieClient, PaymentMethod } from '@mollie/api-client';
import prisma from './prisma';

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

export async function createPayment({
  amount,
  description,
  redirectUrl,
  webhookUrl,
  metadata,
}: {
  amount: number;
  description: string;
  redirectUrl: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}) {
  const mollie = await getMollieClient();

  const payment = await mollie.payments.create({
    amount: {
      currency: 'EUR',
      value: amount.toFixed(2),
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

export async function getPaymentMethods() {
  const mollie = await getMollieClient();
  return await mollie.methods.list();
}

