import { NextResponse } from "next/server";

export async function middleware(request) {
  const publicRoutes = ["/login", "/recuperarPassword"];

  const authenticatedRoutes = ["/news", "/divisiones", "/modulos"];

  const adminRoutes = [
    "/admin/news",
    "/admin/menus",
    "/admin/users",
    "/admin/conexioneserp",
    "/admin/create-company",
    "/admin/videos",
    "/admin/notifications",
    "/admin/integradores",
    "/admin/addendas",
    "/admin/promociones",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(`${route}/`)
  );

  const isAdminRoute =
    adminRoutes.some(
      (route) =>
        request.nextUrl.pathname === route ||
        request.nextUrl.pathname.startsWith(`${route}/`)
    ) || request.nextUrl.pathname.startsWith("/admin/");

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/tableros/");

  const isAuthenticated = request.cookies.has("auth");
  const profileNameCookie = request.cookies.get("profileName");
  const profileName = profileNameCookie?.value;
  const userId = request.cookies.get("idUser")?.value;

  const isAdmin = profileName?.includes("ADMIN");
  const isAdvan = profileName?.includes("ADVAN");

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthenticated && isAdminRoute) {
    const isUserCustomer = profileName?.includes("USERCUSTOMER");
    const allowedUserCustomerPaths = ["/admin/integradores"];
    const isAllowedPath = allowedUserCustomerPaths.some((path) => request.nextUrl.pathname.startsWith(path));

    if (!isAdmin && !isAdvan && !(isUserCustomer && isAllowedPath)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isAuthenticated && isDashboardRoute && userId) {
    try {
      const dashboardsResponse = await fetch(
        `${request.nextUrl.origin}/api/dashboards/user/${userId}`,
        {
          headers: {
            Cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (dashboardsResponse.ok) {
        const dashboardsData = await dashboardsResponse.json();

        if (dashboardsData.statusCode === "200") {
          const userDashboards = dashboardsData.data || [];

          const currentDashboardPath = request.nextUrl.pathname.substring(1); 

          const hasAccess = userDashboards.some(
            (dashboard) => dashboard.url === currentDashboardPath
          );

          if (!hasAccess) {
            const referer = request.headers.get("referer");
            const redirectUrl =
              referer && referer.includes(request.nextUrl.origin)
                ? referer
                : new URL("/", request.url);

            return NextResponse.redirect(redirectUrl);
          }
        } else {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } else {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else if (isAuthenticated && isDashboardRoute && !userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|.*\\..*).*)"],
};
