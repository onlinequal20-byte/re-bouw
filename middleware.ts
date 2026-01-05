import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/simple-auth';

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
    loginUrl.searchParams.set('callbackUrl', request.url);
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
    '/login',
  ],
};

