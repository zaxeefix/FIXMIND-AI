import { NextRequest, NextResponse } from "next/server";

const sessionCookie = "fixmind_session";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdminLogin = pathname === "/admin/login";
  const isTechnicianLogin = pathname === "/technician/login";
  const protectedArea =
    (pathname.startsWith("/admin") && !isAdminLogin) ||
    (pathname.startsWith("/technician") && !isTechnicianLogin) ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/book");

  if (!protectedArea || request.cookies.has(sessionCookie)) return NextResponse.next();

  const loginPath = pathname.startsWith("/admin")
    ? "/admin/login"
    : pathname.startsWith("/technician")
      ? "/technician/login"
      : "/login";
  const loginUrl = new URL(loginPath, request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/technician/:path*", "/dashboard/:path*", "/book/:path*"],
};
