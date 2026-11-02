"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function UserMenu({ user }: { user?: { name?: string | null; email?: string | null } }) {
  if (!user) {
    return (
      <Link href="/admin" className="font-semibold text-ink hover:text-brand-text">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="hidden text-muted sm:inline">{user.name || user.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="font-semibold text-ink hover:text-brand-text"
      >
        Sign out
      </button>
    </div>
  );
}
