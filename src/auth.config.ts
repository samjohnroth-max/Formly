import type { NextAuthConfig } from "next-auth";

// Edge-safe config — no Prisma imports. Used by middleware.
// Full config with PrismaAdapter lives in src/lib/auth/index.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  providers: [],
  callbacks: {
    authorized() {
      // Let the custom middleware handler own all redirect logic.
      // Returning true here means NextAuth never redirects on its own.
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const rememberMe = (user as any).rememberMe === true;
        // Set JWT expiry: 30 days with remember me, 24h without
        token.exp = Math.floor(Date.now() / 1000) + (rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60);
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
