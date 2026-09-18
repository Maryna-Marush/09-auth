import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const PUBLIC_ROUTES = ['/login', '/register'];


const PROTECTED_ROUTES = ['/dashboard', '/profile'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  

  const token = request.cookies.get('token')?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }


  return NextResponse.next();
}


export const config = {
  matcher: [
 
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
