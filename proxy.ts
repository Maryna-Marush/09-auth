import { NextRequest, NextResponse } from 'next/server';
import { checkSession } from './lib/api/serverApi';
const publicRoutes = ['/sign-in', '/sign-up'];
const privateRoutes = ['/profile/:path*', '/notes/:path*'];
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPrivateRoute = privateRoutes.some(route => {
    const baseRoute = route.replace('/:path*', '');
    return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
  });
  if (isPrivateRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  if (isPrivateRoute && !accessToken && refreshToken) {
    try {
      await checkSession();
    } catch {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};