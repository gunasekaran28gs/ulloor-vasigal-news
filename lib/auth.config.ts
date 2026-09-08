import type { NextAuthConfig } from "next-auth";

// Edge-safe config: NO Prisma, NO bcrypt, NO providers here.
// Middleware imports only this file, keeping the Edge Function bundle small.
// The full config (with Credentials provider) lives in auth.ts and is used
// everywhere else (API routes, server components) which run in the Node runtime.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin",
  },
  providers: [], // populated in auth.ts
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
