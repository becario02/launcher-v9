import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/recuperarPassword'];
  
  // Define routes accessible to all authenticated users
  const authenticatedRoutes = ['/news', '/divisiones', '/modulos'];
  
  // Define admin-only routes
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
  
  // Check if current path is dashboard route
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/tableros/');
  
  // Check authentication and role
  const isAuthenticated = request.cookies.has('auth');
  const profileNameCookie = request.cookies.get('profileName');
  const profileName = profileNameCookie?.value;
  const userId = request.cookies.get('idUser')?.value;
  
  console.log('Middleware Debug:', {
    pathname: request.nextUrl.pathname,
    isAuthenticated,
    profileName,
    isAdminRoute,
    isPublicRoute,
    isDashboardRoute
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
  
  // Dashboard access validation
  if (isAuthenticated && isDashboardRoute && userId) {
    try {
      console.log('Validating dashboard access for user:', userId);
      
      // Get user dashboards
      const dashboardsResponse = await fetch(
        `${request.nextUrl.origin}/api/users/dashboards?userId=${userId}`,
        {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        }
      );

      if (dashboardsResponse.ok) {
        const dashboardsData = await dashboardsResponse.json();
        
        if (dashboardsData.statusCode === "200" && dashboardsData.data) {
          // Extract dashboard path from URL
          const currentDashboardPath = request.nextUrl.pathname.substring(1); // Remove leading '/'
          
          // Check if user has access to this dashboard
          const hasAccess = dashboardsData.data.some(
            dashboard => dashboard.url === currentDashboardPath
          );

          if (!hasAccess) {
            console.log('Redirecting to home - no dashboard access');
            
            // Get referer to redirect back to previous page, or home as fallback
            const referer = request.headers.get('referer');
            const redirectUrl = referer && referer.includes(request.nextUrl.origin) 
              ? referer 
              : new URL('/', request.url);
            
            return NextResponse.redirect(redirectUrl);
          }
        } else {
          console.log('Invalid dashboard response, redirecting to home');
          return NextResponse.redirect(new URL('/', request.url));
        }
      } else {
        console.log('Dashboard API error, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Dashboard validation error:', error);
      // On error, redirect to home for safety
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  console.log('Allowing access to:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico|.*\\..*).*)' 
  ]
};