import { NextResponse } from 'next/server';

/**
 * Handle unexpected API errors with safe production responses.
 * Logs full error server-side; returns generic Dutch message to client.
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  const message = error instanceof Error ? error.message : 'Onbekende fout';
  console.error(`[${context}]`, message, error);

  // Production: never leak details
  return NextResponse.json(
    { error: 'Er ging iets mis' },
    { status: 500 }
  );
}

/**
 * Return a 400 validation error with field-level details.
 */
export function validationError(errors: Record<string, string[]>): NextResponse {
  return NextResponse.json(
    { error: 'Validatiefout', fields: errors },
    { status: 400 }
  );
}
