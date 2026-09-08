export type Role = "ADMIN" | "EDITOR" | "WRITER" | "READER";

export const canWrite = (role?: Role) =>
  role === "ADMIN" || role === "EDITOR" || role === "WRITER";

export const canPublish = (role?: Role) =>
  role === "ADMIN" || role === "EDITOR";

export const canManageUsers = (role?: Role) => role === "ADMIN";

export const canManageCategories = (role?: Role) =>
  role === "ADMIN" || role === "EDITOR";
