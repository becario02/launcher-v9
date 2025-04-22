import { NextResponse } from 'next/server';

export function middleware(request) {
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/recuperarPassword'];
  
  // Define routes accessible to all authenticated users
  const authenticatedRoutes = ['/news'];
  
  // Define admin-only routes
  const adminRoutes = ['/admin/news', '/admin/menus', '/admin/users'];
  
  // Check if current path is public or admin
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );
  
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );
  
  // Check authentication and role
  const isAuthenticated = request.cookies.has('auth');
  const profileName = request.cookies.get('profileName')?.value;
  const isAdmin = profileName === 'Administrador ADVAN';

  // If not authenticated and not on a public route, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated but on login page, redirect to home
  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If accessing admin route but not an admin, redirect to home
  if (isAuthenticated && isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|public|.*\\..*).*)' 
  ]
};