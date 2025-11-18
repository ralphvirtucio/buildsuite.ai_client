import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (process.env.NODE_ENV === 'production') {
    if (pathname === '/unauthenticated') {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('session_id');
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/unauthenticated', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
