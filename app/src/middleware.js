import { NextResponse } from 'next/server';

export function middleware(request) {
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/recuperarPassword'];
  
  // Define routes accessible to all authenticated users
  const authenticatedRoutes = ['/news', '/divisiones', '/modulos'];
  
  // Define admin-only routes (incluye todas las rutas de admin del Sidebar)
  const adminRoutes = [
    '/admin/news', 
    '/admin/menus', 
    '/admin/users', 
    '/admin/videos',
    '/admin/notifications',
    '/admin/integradores',
    '/admin/addendas',
    '/admin/promociones'
  ];
  
  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );
  
  // Check if current path is admin route
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  ) || request.nextUrl.pathname.startsWith('/admin/');
  
  // Check authentication and role
  const isAuthenticated = request.cookies.has('auth');
  const profileNameCookie = request.cookies.get('profileName');
  const profileName = profileNameCookie?.value;
  
  console.log('Middleware Debug:', {
    pathname: request.nextUrl.pathname,
    isAuthenticated,
    profileName,
    isAdminRoute,
    isPublicRoute
  });
  
  const isAdmin = profileName?.includes('ADMIN');
  const isAdvan = profileName?.includes('ADVAN');
  
  // If not authenticated and not on a public route, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    console.log('Redirecting to login - not authenticated');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated but on login page, redirect to home
  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    console.log('Redirecting to home - authenticated on login page');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If accessing admin route but not an admin or advan, redirect to home
  if (isAuthenticated && isAdminRoute && !isAdmin && !isAdvan) {
    console.log('Redirecting to home - not admin/advan accessing admin route');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  console.log('Allowing access to:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico|.*\\..*).*)' 
  ]
};