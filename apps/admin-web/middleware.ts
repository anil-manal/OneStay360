import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const hostname = req.headers.get("host") || "";

  // Bypass Next.js internal static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. Admin Subdomain: admin.onestay360.in or admin.localhost:3000
  if (hostname.startsWith("admin.") || hostname.startsWith("admin-")) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.next();
    }
    const targetPath = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return NextResponse.rewrite(new URL(targetPath, req.url));
  }

  // 2. Partner / Landlord Subdomain: partner.onestay360.in or business.onestay360.in
  if (
    hostname.startsWith("partner.") ||
    hostname.startsWith("business.") ||
    hostname.startsWith("landlord.")
  ) {
    if (pathname.startsWith("/business")) {
      return NextResponse.next();
    }
    const targetPath = pathname === "/" ? "/business" : `/business${pathname}`;
    return NextResponse.rewrite(new URL(targetPath, req.url));
  }

  // 3. Tenant Subdomain: app.onestay360.in or my.onestay360.in or tenant.onestay360.in
  if (
    hostname.startsWith("app.") ||
    hostname.startsWith("my.") ||
    hostname.startsWith("tenant.")
  ) {
    if (pathname.startsWith("/tenant")) {
      return NextResponse.next();
    }
    const targetPath = pathname === "/" ? "/tenant" : `/tenant${pathname}`;
    return NextResponse.rewrite(new URL(targetPath, req.url));
  }

  // Standard root / path-based routing (e.g. onestay360.in/admin, localhost:3000/business)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
