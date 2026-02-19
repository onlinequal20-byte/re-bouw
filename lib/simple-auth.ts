import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
}

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export interface SessionPayload {
  userId: string;
  email: string;
  name?: string;
  expiresAt?: Date;
  [key: string]: unknown;
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, secret, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function createSession(userId: string, email: string, name: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, email, name, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  if (!parsed) return;

  parsed.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: parsed.expiresAt,
    sameSite: 'lax',
    path: '/',
  });
  return res;
}
