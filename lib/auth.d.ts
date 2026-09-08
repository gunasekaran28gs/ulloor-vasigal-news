import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "EDITOR" | "WRITER" | "READER";
    } & DefaultSession["user"];
  }
}
