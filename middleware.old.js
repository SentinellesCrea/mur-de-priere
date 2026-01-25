import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  /* ================= ADMIN ================= */
  if (pathname.startsWith("/api/admin")) {
    const token = req.cookies.get("adminToken")?.value;

    if (!token) {
      return new NextResponse("Accès interdit", { status: 403 });
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.role !== "admin") {
        return new NextResponse("Rôle non autorisé", { status: 403 });
      }
    } catch {
      return new NextResponse("Token invalide", { status: 403 });
    }
  }

  /* ============ VOLUNTEER / SUPERVISOR ============ */
  const isProtectedVolunteerPage =
    (pathname.startsWith("/volunteers") &&
      !pathname.startsWith("/volunteers/login") &&
      !pathname.startsWith("/volunteers/signup")) ||
    pathname.startsWith("/supervisor");

  if (isProtectedVolunteerPage) {
    const token = req.cookies.get("volunteerToken")?.value;

    if (!token) {
      return new NextResponse("Accès interdit", { status: 403 });
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      if (!["volunteer", "supervisor"].includes(payload.role)) {
        return new NextResponse("Rôle non autorisé", { status: 403 });
      }
    } catch {
      return new NextResponse("Token invalide", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/volunteers/:path*",
    "/supervisor/:path*",
  ],
};
