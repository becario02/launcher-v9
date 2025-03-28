import { NextResponse } from 'next/server';
 
export function middleware(request) {
  const publicRoutes = ['/login', '/recuperarPassword'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );
  
  const isAuthenticated = request.cookies.has('auth');

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}
 
export const config = {
  matcher: [
    '/((?!api|_next|public|.*\\..*).*)'
  ]
};