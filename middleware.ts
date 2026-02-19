import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/simple-auth';

/*
 * CSRF Protection Note (SEC-06):
 * Explicit CSRF tokens are unnecessary for this application because:
 * 1. Session cookies use SameSite=Lax, which prevents cross-origin requests
 *    from including cookies on POST/PUT/PATCH/DELETE (mutation) requests.
 * 2. All state-changing operations use non-GET HTTP methods.
 * 3. SameSite=Lax + non-GET mutations = browser blocks cross-origin mutations.
 */

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const sessionData = session ? await decrypt(session) : null;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  if (isAuthPage) {
    if (sessionData) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!sessionData) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/klanten/:path*',
    '/offertes/:path*',
    '/facturen/:path*',
    '/prijzen/:path*',
    '/instellingen/:path*',
    '/kosten/:path*',
    '/email/:path*',
    '/admin/:path*',
    '/login',
  ],
};
