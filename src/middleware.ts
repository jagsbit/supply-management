import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname === "/login") {
    if (session) {
      const role = (session.user as { role: string }).role;
      return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin/requests" : "/employee/requests", req.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = (session.user as { role: string }).role;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/employee/requests", req.url));
  }

  if (pathname.startsWith("/employee") && role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL("/admin/requests", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/admin/:path*", "/employee/:path*", "/"],
};
