import { DefaultSession } from "next-auth";
import type { Role } from "./permissions";

// Named next-auth.d.ts on purpose: TypeScript ignores auth.d.ts while auth.ts sits beside it.
declare module "next-auth" {
  interface User {
    role?: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}
