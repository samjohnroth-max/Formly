import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  ...authConfig,
  adapter: {
    ...PrismaAdapter(db),
    linkAccount: (account) => db.authAccount.create({ data: account }) as never,
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
        rememberMe: { type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
            select: { id: true, email: true, name: true, password: true },
          });

          if (!user?.password) {
            console.error("[auth] authorize: no user or no password hash for", credentials.email);
            return null;
          }

          const valid = await compare(
            credentials.password as string,
            user.password
          );

          if (!valid) {
            console.error("[auth] authorize: password mismatch for", credentials.email);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            rememberMe: credentials.rememberMe === "true",
          };
        } catch (err) {
          console.error("[auth] authorize: unexpected error:", err);
          return null;
        }
      },
    }),
  ],
});
