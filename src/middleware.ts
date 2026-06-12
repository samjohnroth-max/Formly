import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth-error",
  "/api/auth",
  // OAuth callback must not be intercepted — code+state params would be lost on a
  // middleware→login redirect. The route itself calls getRequiredSession() for auth.
  "/api/integrations/meta/callback",
];
const WEBHOOK_PATHS = ["/api/webhooks"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  if (WEBHOOK_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
