import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/feed', '/explore', '/planner', '/forums', '/profile', '/reviews', '/settings'];
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (token && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to onboarding if not complete (except for onboarding page itself and API routes)
  if (
    token &&
    !token.onboardingComplete &&
    !pathname.startsWith('/onboarding') &&
    !pathname.startsWith('/api') &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/feed/:path*',
    '/explore/:path*',
    '/planner/:path*',
    '/forums/:path*',
    '/profile/:path*',
    '/reviews/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
    '/onboarding',
  ],
};
