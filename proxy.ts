import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSetCookie } from 'cookie';
import { checkSession } from './lib/api/serverApi';

const publicRoutes = ['/sign-in', '/sign-up'];
const privateRoutes = ['/profile/:path*', '/notes/:path*'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const isPublicRoute = publicRoutes.includes(pathname);

  const isPrivateRoute = privateRoutes.some(route => {
    const baseRoute = route.replace('/:path*', '');

    return (
      pathname === baseRoute ||
      pathname.startsWith(`${baseRoute}/`)
    );
  });

  if (isPrivateRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPrivateRoute && !accessToken && refreshToken) {
    try {
      const response = await checkSession();

      const setCookie = response.headers['set-cookie'];

      if (setCookie) {
        const cookiesArray = Array.isArray(setCookie)
          ? setCookie
          : [setCookie];

        cookiesArray.forEach(cookieString => {
          const parsedCookie = parseSetCookie(cookieString);

          if (parsedCookie.name && parsedCookie.value !== undefined) {
            cookieStore.set({
              name: parsedCookie.name,
              value: parsedCookie.value,
              ...(parsedCookie.expires && {
                expires: parsedCookie.expires,
              }),
              ...(parsedCookie.maxAge !== undefined && {
                maxAge: parsedCookie.maxAge,
              }),
              ...(parsedCookie.domain && {
                domain: parsedCookie.domain,
              }),
              ...(parsedCookie.path && {
                path: parsedCookie.path,
              }),
              ...(parsedCookie.httpOnly !== undefined && {
                httpOnly: parsedCookie.httpOnly,
              }),
              ...(parsedCookie.secure !== undefined && {
                secure: parsedCookie.secure,
              }),
              ...(parsedCookie.sameSite && {
                sameSite: parsedCookie.sameSite,
              }),
            });
          }
        });
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};