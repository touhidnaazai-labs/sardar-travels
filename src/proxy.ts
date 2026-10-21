import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for the dashboard: bounce visitors without a session cookie
 * to the login page. Real validation happens server-side in requireUser().
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!req.cookies.get("st_session")?.value) {
    const url = new URL("/admin/login", req.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
