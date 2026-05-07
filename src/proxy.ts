import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const session = req.cookies.get("session");

  const isDashboardRoute =
    req.nextUrl.pathname.startsWith("/dashboard");

  // protect dashboard
  if (isDashboardRoute && !session) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};