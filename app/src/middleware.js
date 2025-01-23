import { NextResponse } from 'next/server';
 
export function middleware(request) {
  const isAuthenticated = request.cookies.has('auth');
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
 
export const config = {
  matcher: [
    '/((?!api|_next|public|.*\\..*).*)'
  ]
};