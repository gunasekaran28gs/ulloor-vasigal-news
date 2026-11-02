import type { NextAuthConfig } from "next-auth";
import type { Role } from "./permissions";

// Edge-safe config: NO Prisma, NO bcrypt, NO providers here.
// proxy.ts imports only this file, keeping the Edge Function bundle small.
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
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
