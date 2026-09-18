import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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
          const [cookiePair, ...attributes] = cookieString.split(';');
          const [name, ...valueParts] = cookiePair.split('=');

          if (!name) return;

          const value = valueParts.join('=');

          const cookieOptions: {
            expires?: Date;
            maxAge?: number;
            domain?: string;
            path?: string;
            secure?: boolean;
            httpOnly?: boolean;
            sameSite?: 'strict' | 'lax' | 'none';
          } = {};

          attributes.forEach(attribute => {
            const [key, ...parts] = attribute.trim().split('=');
            const lowerKey = key.toLowerCase();
            const attributeValue = parts.join('=');

            if (lowerKey === 'path') {
              cookieOptions.path = attributeValue;
            }

            if (lowerKey === 'domain') {
              cookieOptions.domain = attributeValue;
            }

            if (lowerKey === 'max-age') {
              cookieOptions.maxAge = Number(attributeValue);
            }

            if (lowerKey === 'expires') {
              cookieOptions.expires = new Date(attributeValue);
            }

            if (lowerKey === 'secure') {
              cookieOptions.secure = true;
            }

            if (lowerKey === 'httponly') {
              cookieOptions.httpOnly = true;
            }

            if (lowerKey === 'samesite') {
              const sameSite = attributeValue.toLowerCase();

              if (
                sameSite === 'strict' ||
                sameSite === 'lax' ||
                sameSite === 'none'
              ) {
                cookieOptions.sameSite = sameSite;
              }
            }
          });

          cookieStore.set(name.trim(), value, cookieOptions);
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