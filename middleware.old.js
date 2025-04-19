import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 🔐 Protection des routes API Admin (déjà en place)
  const adminRoutes = ["/api/admin/me", "/api/admin/dashboard", "/api/admin/missions"];
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Accès interdit, token requis" }, { status: 401 });
    }
    try {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ message: "Token invalide ou expiré" }, { status: 403 });
    }
  }

  // 🛡️ Protection des pages bénévoles
  if (pathname.startsWith("/volunteers") && !pathname.startsWith("/volunteers/login") && !pathname.startsWith("/volunteers/signup")) {
    const token = req.cookies.get("volunteerToken")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/volunteers/login", req.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch (err) {
      return NextResponse.redirect(new URL("/volunteers/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*", "/volunteers/:path*"],
};
