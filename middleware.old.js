import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 🔐 Protection des routes API Admin (header Authorization)
  const adminRoutes = ["/api/admin/me", "/api/admin/dashboard", "/api/admin/missions"];
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Accès interdit, token requis" }, { status: 401 });
    }
    try {
      const token = authHeader.split(" ")[1];
      jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch (error) {
      return NextResponse.json({ message: "Token invalide ou expiré" }, { status: 403 });
    }
  }

  // 🛡️ Protection des pages bénévoles ET superviseurs
  const isProtectedVolunteerPage =
    (pathname.startsWith("/volunteers") && !pathname.startsWith("/volunteers/login") && !pathname.startsWith("/volunteers/signup")) ||
    pathname.startsWith("/supervisor");

  if (isProtectedVolunteerPage) {
    const token = req.cookies.get("volunteerToken")?.value;

    if (!token) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      const role = payload.role;

      if (!["volunteer", "supervisor"].includes(role)) {
        return new NextResponse("Rôle non autorisé", { status: 403 });
      }
    } catch (err) {
      return new NextResponse("Token invalide", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/volunteers/:path*",
    "/supervisor/:path*" // ✅ Ajout critique ici
  ],
};
