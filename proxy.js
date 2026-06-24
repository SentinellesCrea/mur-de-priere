import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function verifyRole(token, roles) {
  if (!token || !process.env.JWT_SECRET) return false;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    return roles.includes(payload.role);
  } catch {
    return false;
  }
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)
  ) {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ message: "Origine non autorisée" }, { status: 403 });
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!verifyRole(request.cookies.get("adminToken")?.value, ["admin"])) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/supervisor")) {
    if (!verifyRole(request.cookies.get("volunteerToken")?.value, ["supervisor"])) {
      return NextResponse.redirect(new URL("/volunteers/login", request.url));
    }
  }

  const publicVolunteerPages = new Set([
    "/volunteers/login",
    "/volunteers/signup",
    "/volunteers/reset-password",
    "/volunteers/conditions",
  ]);
  if (pathname.startsWith("/volunteers") && !publicVolunteerPages.has(pathname)) {
    if (!verifyRole(request.cookies.get("volunteerToken")?.value, ["volunteer", "supervisor"])) {
      return NextResponse.redirect(new URL("/volunteers/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/supervisor/:path*", "/volunteers/:path*"],
};
