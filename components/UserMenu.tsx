"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function UserMenu({ user }: { user?: { name?: string | null; email?: string | null } }) {
  if (!user) {
    return (
      <Link href="/admin" className="text-sm font-semibold hover:text-red-700">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden sm:inline text-gray-600">{user.name || user.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="font-semibold text-gray-500 hover:text-red-700"
      >
        Sign out
      </button>
    </div>
  );
}
