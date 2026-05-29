import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.method === "GET" && request.nextUrl.pathname === "/admin/bokkings") {
    return NextResponse.redirect(new URL("/admin/bookings", request.url));
  }

  if (request.method === "POST" && request.nextUrl.pathname === "/admin/login") {
    return NextResponse.rewrite(new URL("/api/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/login", "/admin/bokkings"],
};
