// src/middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Excluir rutas estáticas/api
  const publicPaths = ['/login', '/api', '/_next', '/static'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  const hasAuthCookie = request.cookies.has('user');

  // Redirigir a login si no hay cookie y no es ruta pública
  if (!hasAuthCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};